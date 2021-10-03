declare module 'combos' {
  const combos: <Key, Value>(
    keysToPossibleValues: Record<Key, Value[]>,
  ) => Record<Key, Value>[];

  export default combos;
}
