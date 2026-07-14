/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getBranchesFromStudentId(id: string): string[] {
  if (!id || id === "-") return [];
  const cleaned = id.trim().toUpperCase();
  if (cleaned.length < 10) return [];

  // Extract potential branch codes from the ID
  // In BITS student IDs, the branch codes are at indices 4-5 (first degree) and 6-7 (second degree/PS)
  const code1 = cleaned.substring(4, 6);
  const code2 = cleaned.substring(6, 8);

  const mapping: { [key: string]: string } = {
    "A1": "CHE",
    "A7": "CS",
    "A3": "EEE",
    "AA": "ECE",
    "A8": "ENI",
    "AJ": "ENS",
    "AD": "MNC",
    "A4": "MECH",
    "B1": "BIO/BIOT",
    "B2": "CHEM",
    "B3": "ECON",
    "B4": "MATH",
    "B5": "PHY",
    "B7": "SNN"
  };

  const branches: string[] = [];
  if (mapping[code1]) {
    branches.push(mapping[code1]);
  }
  if (mapping[code2]) {
    branches.push(mapping[code2]);
  }

  // Fallback: if we didn't extract any branch from the specific positions,
  // do a substring search for keys to be extremely robust.
  if (branches.length === 0) {
    Object.keys(mapping).forEach((key) => {
      if (cleaned.includes(key)) {
        branches.push(mapping[key]);
      }
    });
  }

  return Array.from(new Set(branches));
}

export function matchesBranchDepartment(courseDept: string, branch: string): boolean {
  const cd = courseDept.toUpperCase().trim();
  const br = branch.toUpperCase().trim();

  if (cd === br) return true;

  // Mappings to cover standard variations in database entries
  if (br === "CS" && cd === "CS") return true;
  if (br === "CHE" && (cd === "CHE" || cd === "CH" || cd === "CHEMICAL")) return true;
  if (br === "EEE" && (cd === "EEE" || cd === "EE" || cd === "ELECTRICAL")) return true;
  if (br === "ECE" && (cd === "ECE" || cd === "ELECTRONICS")) return true;
  if (br === "ENI" && (cd === "ENI" || cd === "INSTR" || cd === "INSTRUMENTATION")) return true;
  if (br === "ENS" && cd === "ENS") return true;
  if (br === "MNC" && (cd === "MNC" || cd === "MATH" || cd === "MA")) return true;
  if (br === "MECH" && (cd === "MECH" || cd === "ME" || cd === "MECHANICAL")) return true;
  if (br === "BIO/BIOT" && (cd === "BIO" || cd === "BIOT" || cd === "BIOLOGY" || cd === "BIOTECH" || cd === "BIO/BIOT")) return true;
  if (br === "CHEM" && (cd === "CHEM" || cd === "CHY" || cd === "CHEMISTRY")) return true;
  if (br === "ECON" && (cd === "ECON" || cd === "ECO" || cd === "ECONOMICS")) return true;
  if (br === "MATH" && (cd === "MATH" || cd === "MA" || cd === "MATHEMATICS")) return true;
  if (br === "PHY" && (cd === "PHY" || cd === "PH" || cd === "PHYSICS")) return true;
  if (br === "SNN" && cd === "SNN") return true;

  return false;
}
