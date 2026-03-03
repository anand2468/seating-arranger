const data = [
    "22A1", "22A2", "22A3", "22A4",
    "22B1", "22B2", "22B3"
];
export const findLimits = (data) => {
    // Step 1: group numbers by prefix
    const groups = {};

    data.forEach(item => {
        // split prefix and number
        const match = item.match(/([A-Za-z0-9]+?)(\d+)$/);

        const prefix = match[1];      // 22A
        const num = parseInt(match[2]); // 1,2,3...

        if (!groups[prefix]) {
            groups[prefix] = [];
        }

        groups[prefix].push(num);
    });

    const result = [];

    // Step 2: create ranges
    for (const prefix in groups) {
        const nums = groups[prefix].sort((a, b) => a - b);

        let start = nums[0];
        let prev = nums[0];

        for (let i = 1; i < nums.length; i++) {
            const n = nums[i];

            if (n === prev + 1) {
                // consecutive
                prev = n;
            } else {
                // save previous range
                if (start === prev) {
                    result.push(`${prefix}${start}`);
                } else {
                    result.push(`${prefix}${start}-${prefix}${prev}`);
                }
                start = prev = n;
            }
        }

        // add last range
        if (start === prev) {
            result.push(`${prefix}${start}`);
        } else {
            result.push(`${prefix}${start}-${prefix}${prev}`);
        }
    }

    console.log(result.join(", "));
    return result

}