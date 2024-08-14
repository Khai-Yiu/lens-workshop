import lens, { view, set, over } from './lens';

type Address = {
    city: string;
    zip: string;
};

type User = {
    name: string;
    address: Address;
};

describe('lens', () => {
    const user = {
        name: 'Alice',
        address: { city: 'Wonderland', zip: '12345' }
    };
    const nameLens = lens<User, string>(
        (user) => user.name,
        (newName, user) => ({ ...user, name: newName })
    );
    const cityLens = lens<User, string>(
        (user) => user.address.city,
        (newCity, user) => ({
            ...user,
            address: { ...user.address, city: newCity }
        })
    );
    describe('view', () => {
        it('view should retrieve the value using the lens', () => {
            expect(view(nameLens, user)).toBe('Alice');
            expect(view(cityLens, user)).toBe('Wonderland');
        });
    });
    describe('set', () => {
        it('set should update the value using the lens', () => {
            const updatedUser = set(nameLens, 'Gerald', user);
            expect(updatedUser).not.toBe(user);
            expect(updatedUser).toEqual({
                name: 'Gerald',
                address: { city: 'Wonderland', zip: '12345' }
            });
        });
    });
    describe('over', () => {
        it('over should modify the value using the lens', () => {
            const updatedUser = over(
                nameLens,
                (name: string): string => name.toUpperCase(),
                user
            );
            expect(updatedUser).not.toBe(user);
            expect(updatedUser).toEqual({
                name: 'ALICE',
                address: { city: 'Wonderland', zip: '12345' }
            });
        });
    });
    describe('state copying behaviour', () => {
        interface DeepState {
            user: User;
            meta: {
                created: string;
                modified: string;
            };
        }

        const deepState: DeepState = {
            user: {
                name: 'Alice',
                address: { city: 'Wonderland', zip: '12345' }
            },
            meta: { created: '2023-01-01', modified: '2024-01-01' }
        };
        const userLens = lens<DeepState, User>(
            (state) => state.user,
            (newUser, state) => ({ ...state, user: newUser })
        );
        const cityLens = lens<User, string>(
            (user) => user.address.city,
            (newCity, user) => ({
                ...user,
                address: { ...user.address, city: newCity }
            })
        );

        const deepCityLens = lens<DeepState, string>(
            (state) => view(cityLens, state.user),
            (newCity, state) =>
                set(userLens, set(cityLens, newCity, state.user), state)
        );

        it('set should copy the state correctly and only update the necessary parts', () => {
            const updatedDeepState = set(deepCityLens, 'Oz', deepState);
            expect(updatedDeepState).not.toBe(deepState);
            expect(updatedDeepState).toEqual({
                user: {
                    name: 'Alice',
                    address: { city: 'Oz', zip: '12345' }
                },
                meta: { created: '2023-01-01', modified: '2024-01-01' }
            });
            expect(updatedDeepState.user).not.toBe(deepState.user);
            expect(updatedDeepState.user.address).not.toBe(
                deepState.user.address
            );
            expect(updatedDeepState.meta).toBe(deepState.meta);
        });
        it('over should modify the state correctly and only update the necessary parts', () => {
            const upperCaseCityState = over(
                deepCityLens,
                (city) => city.toUpperCase(),
                deepState
            );

            expect(upperCaseCityState).not.toBe(deepState);
            expect(upperCaseCityState).toEqual({
                user: {
                    name: 'Alice',
                    address: { city: 'WONDERLAND', zip: '12345' }
                },
                meta: { created: '2023-01-01', modified: '2024-01-01' }
            });
            expect(upperCaseCityState.user).not.toBe(deepState.user);
            expect(upperCaseCityState.user.address).not.toBe(
                deepState.user.address
            );
            expect(upperCaseCityState.meta).toBe(deepState.meta);
        });
    });
});
