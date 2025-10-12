function satisfyConstraintArray(arr, n) {
    // NOTE: this method is a perf hotspot so be careful with changes
    n = n || 1;

    const len = arr.length;
    let cons;

    if (!len) return;

    //loop over the rest length
    while (n--) {
        for (let cIndex = 0; cIndex < len; ++cIndex) {
            cons = arr[cIndex];

            const constraints = cons.constraints,
                num = constraints.length;

            var pin = cons.pin,
                pos = cons.pos,
                invWeight = cons.invWeight,
                tmp1X,
                tmp1Y,
                tmp2X,
                tmp2Y;

            if (pin.x !== -1 /* Constants.UNDEFINED */) {
                pos.x = pin.x;
                pos.y = pin.y;
                continue;
            }

            for (let i = 0; i < num; i++) {
                const c = constraints[i],
                    cp = c.cp,
                    cpPos = cp.pos;

                tmp1X = cpPos.x - pos.x;
                tmp1Y = cpPos.y - pos.y;

                if (tmp1X === 0 && tmp1Y === 0) {
                    tmp1X = 1;
                    tmp1Y = 1;
                }

                const sqrDeltaLength = tmp1X * tmp1X + tmp1Y * tmp1Y, // get dot product inline
                    restLength = c.restLength,
                    sqrRestLength = restLength * restLength,
                    cType = c.type;

                if (cType === 1 /* ConstraintType.NOT_MORE_THAN */) {
                    if (sqrDeltaLength <= sqrRestLength) continue;
                } else if (cType === 2 /*ConstraintType.NOT_LESS_THAN */) {
                    if (sqrDeltaLength >= sqrRestLength) continue;
                }

                const pinUndefined = cp.pin.x === -1 /* Constants.UNDEFINED */,
                    invWeight2 = cp.invWeight,
                    deltaLength = Math.sqrt(sqrDeltaLength),
                    minDeltaLength = deltaLength > 1 ? deltaLength : 1,
                    diff = (deltaLength - restLength) / (minDeltaLength * (invWeight + invWeight2));

                // copy the first position before modification
                if (pinUndefined) {
                    tmp2X = tmp1X;
                    tmp2Y = tmp1Y;
                }

                const tmp1Multiplier = invWeight * diff;
                tmp1X *= tmp1Multiplier;
                tmp1Y *= tmp1Multiplier;

                pos.x += tmp1X;
                pos.y += tmp1Y;

                if (pinUndefined) {
                    const tmp2Multiplier = invWeight2 * diff;
                    cpPos.x -= tmp2X * tmp2Multiplier;
                    cpPos.y -= tmp2Y * tmp2Multiplier;
                }
            }
        }
    } //end while
}

export default satisfyConstraintArray;
