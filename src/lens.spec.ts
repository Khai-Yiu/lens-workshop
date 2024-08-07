import lens from '@/lens.js';

describe('lens,', () => {
    const user = {
        name: 'Alice',
        address: { city: 'Wonderland', zip: '12345' }
    };
    it('view should retrieve the value using the lens', () => {
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
        expect(view(nameLens, user)).toBe('Alice');
        expect(view(cityLens, user)).toBe('Wonderland');
    });
});
