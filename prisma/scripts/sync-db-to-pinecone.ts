import { Pinecone } from "@pinecone-database/pinecone";
import prismaDB from "../../lib/prisma";
import { inferAttributes } from "../../lib/rollup/infer-rollup-details";

async function main() {
  function cleanStr(val?: string | null): string {
    if (!val) return "";
    const s = String(val).trim();
    return s.toLowerCase() === "nan" ? "" : s;
  }

  function cleanNum(val?: string | number | null): number | null {
    if (val === undefined || val === null) return null;
    const s = String(val).trim();
    if (s.toLowerCase() === "nan" || s === "") return null;
    const digits = s.replace(/[^\d]/g, "");
    return digits ? Number(digits) : null;
  }

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const indexName = "dac-deals";

  // 2. Fetch deals
  const deals = await prismaDB.deal.findMany();

  // 3. Prepare records for Pinecone
  const records: any[] = [];
  for (const deal of deals) {
    // Chunk text parts
    const description = cleanStr(deal.dealCaption);
    const location = cleanStr(deal.companyLocation);
    const industry = cleanStr(deal.industry);

    // Meta data parts
    const brokerage = cleanStr(deal.brokerage);
    const revenue = cleanNum(deal.revenue);
    const ebitda = cleanNum(deal.ebitda);
    const firstName = cleanStr(deal.firstName);
    const lastName = cleanStr(deal.lastName);
    const name = firstName + " " + lastName;
    const email = cleanStr(deal.email);
    const linkedinUrl = cleanStr(deal.linkedinUrl);
    const workPhone = cleanStr(deal.workPhone);
    const title = cleanStr(deal.title);
    const dealTeaser = cleanStr(deal.dealTeaser);
    const grossRevenue = cleanNum(deal.grossRevenue);
    const askingPrice = cleanNum(deal.askingPrice);
    const ebitdaMargin = cleanNum(deal.ebitdaMargin);
    const dealType = cleanStr(deal.dealType);
    const sourceWebsite = cleanStr(deal.sourceWebsite);
    const companyLocation = cleanStr(deal.companyLocation);
    const createdAt = cleanStr(
      deal.createdAt ? deal.createdAt.toISOString() : null,
    );
    const updatedAt = cleanStr(
      deal.updatedAt ? deal.updatedAt.toISOString() : null,
    );
    const bitrixLink = cleanStr(deal.bitrixLink);
    const bitrixStatus = cleanStr(deal.status);
    const isReviewed = deal.isReviewed;
    const isPublished = deal.isPublished;
    const seen = deal.seen;
    const bitrixId = cleanStr(deal.bitrixId);
    const bitrixCreatedAt = cleanStr(
      deal.bitrixCreatedAt ? deal.bitrixCreatedAt.toISOString() : null,
    );
    const userId = cleanStr(deal.userId);
    const tags = cleanStr(Array.isArray(deal.tags) ? deal.tags.join(", ") : "");

    const chunk_text = [description, location, industry]
      .filter(Boolean)
      .join(" | ");

    const record: any = { id: deal.id, chunk_text };

    // Add metadata fields
    if (description) record.description = description;
    if (location) record.location = location;
    if (industry) record.industry = industry;
    if (brokerage) record.brokerage = brokerage;
    if (revenue !== null) record.revenue = revenue;
    if (ebitda !== null) record.ebitda = ebitda;
    if (firstName) record.firstName = firstName;
    if (lastName) record.lastName = lastName;
    if (name) record.name = name;
    if (email) record.email = email;
    if (linkedinUrl) record.linkedinUrl = linkedinUrl;
    if (workPhone) record.workPhone = workPhone;
    if (title) record.title = title;
    if (dealTeaser) record.dealTeaser = dealTeaser;
    if (grossRevenue !== null) record.grossRevenue = grossRevenue;
    if (askingPrice !== null) record.askingPrice = askingPrice;
    if (ebitdaMargin !== null) record.ebitdaMargin = ebitdaMargin;
    if (dealType) record.dealType = dealType;
    if (sourceWebsite) record.sourceWebsite = sourceWebsite;
    if (companyLocation) record.companyLocation = companyLocation;
    if (createdAt) record.createdAt = createdAt;
    if (updatedAt) record.updatedAt = updatedAt;
    if (bitrixLink) record.bitrixLink = bitrixLink;
    if (bitrixStatus) record.bitrixStatus = bitrixStatus;
    if (isReviewed) record.isReviewed = isReviewed;
    if (isPublished) record.isPublished = isPublished;
    if (seen) record.seen = seen;
    if (bitrixId) record.bitrixId = bitrixId;
    if (bitrixCreatedAt) record.bitrixCreatedAt = bitrixCreatedAt;
    if (userId) record.userId = userId;
    if (tags) record.tags = tags;

    // const inferred = await inferAttributes(deal);
    // record.business_strategy = inferred.business_strategy;
    // record.growth_stage = inferred.growth_stage;
    // record.confidence_business_strategy =
    //   inferred.confidence_scores.business_strategy;
    // record.confidence_growth_stage = inferred.confidence_scores.growth_stage;

    records.push(record);
  }

  // Upsert records to Pinecone with Batching
  const index = pc.index(indexName).namespace("initial");

  const BATCH_SIZE = 96;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    try {
      await index.upsertRecords(batch);
      console.log(
        `Upserted batch ${i / BATCH_SIZE + 1} (${batch.length} records)`,
      );
    } catch (err) {
      console.error(`Error upserting batch ${i / BATCH_SIZE + 1}:`, err);
    }
  }
}

main().catch(console.error);
