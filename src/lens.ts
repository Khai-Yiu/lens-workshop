type Getter<S, A> = (state: S) => A;
type Setter<S, A> = (valueToSet: A, state: S) => S;
interface Lens<S, A> {
    get: Getter<S, A>;
    set: Setter<S, A>;
}

export const view = <S, A>(lens: Lens<S, A>, state: S): A => lens.get(state);

const lens = <S, A>(
    getter: Getter<S, A>,
    setter: Setter<S, A>
): Lens<S, A> => ({ get: getter, set: setter });

export default lens;
