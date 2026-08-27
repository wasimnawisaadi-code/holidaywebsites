import fs from "fs";

const catalogueContent = fs.readFileSync("src/data/catalogue.ts", "utf8");
const pDetailsA = fs.readFileSync("src/data/package-details-a.ts", "utf8");
const pDetailsB = fs.readFileSync("src/data/package-details-b.ts", "utf8");

const getSlugs = (text) => {
  const matches = [...text.matchAll(/slug:\s*"([^"]+)"/g)];
  return matches.map((m) => m[1]);
};

const getDetailKeys = (text) => {
  const matches = [...text.matchAll(/"([^"]+)":\s*{/g)];
  return matches.map((m) => m[1]);
};

const packageSlugs = getSlugs(catalogueContent);
const detailsKeysA = getDetailKeys(pDetailsA);
const detailsKeysB = getDetailKeys(pDetailsB);
const allDetailKeys = [...detailsKeysA, ...detailsKeysB];

console.log("Packages in Catalogue (" + packageSlugs.length + "):", packageSlugs);
console.log("Packages with details (" + allDetailKeys.length + "):", allDetailKeys);

const missingDetails = packageSlugs.filter((slug) => !allDetailKeys.includes(slug));
console.log("Missing detailed pages (" + missingDetails.length + "):", missingDetails);
