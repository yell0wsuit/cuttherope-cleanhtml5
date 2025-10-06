const levelFiles = import.meta.glob("./boxes/levels/*.json", {
    import: "default",
    eager: true,
});

const groupedLevels = Array.from(
    Object.entries(levelFiles).reduce((accumulator, [path, level]) => {
        const match = path.match(/\/(\d{2})-(\d{2})\.json$/);

        if (!match) {
            return accumulator;
        }

        const [, boxNumber, levelNumber] = match;
        const existing = accumulator.get(boxNumber) ?? [];

        existing.push({ levelNumber, level });
        accumulator.set(boxNumber, existing);

        return accumulator;
    }, new Map())
);

const boxes = groupedLevels
    .sort(([boxA], [boxB]) => boxA.localeCompare(boxB))
    .map(([, levels]) => ({
        levels: levels
            .sort((levelA, levelB) => levelA.levelNumber.localeCompare(levelB.levelNumber))
            .map(({ level }) => level),
    }));

export default boxes;
