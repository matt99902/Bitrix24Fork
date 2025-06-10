import React, { Suspense } from "react";
import DealCardSkeleton from "@/components/skeletons/DealCardSkeleton";
import { Metadata } from "next";
import prismaDB from "@/lib/prisma";
import DealCard from "@/components/DealCard";
import getCurrentUserRole from "@/lib/data/current-user-role";
import GetDeals, { GetAllDeals } from "@/app/actions/get-deal";
import SearchDeals from "@/components/SearchDeal";
import Pagination from "@/components/pagination";
import { setTimeout } from "timers/promises";
import DealTypeFilter from "@/components/DealTypeFilter";
import { DealType } from "@prisma/client";
import SearchDealsSkeleton from "@/components/skeletons/SearchDealsSkeleton";
import SearchEbitdaDeals from "@/components/SearchEbitdaDeals";
import DealTypeFilterSkeleton from "@/components/skeletons/DealTypeFilterSkeleton";
import UserDealFilter from "@/components/UserDealFilter";
import DealContainer from "@/components/DealContainer";
import SearchRevenueDeals from "@/components/search-revenue-deals";
import SearchLocationDeals from "@/components/search-location-deals";
import SearchMaxRevenueDeals from "@/components/search-max-revenue-deals";
import SearchMaxEbitdaDeals from "@/components/search-max-ebitda-deals";

export const metadata: Metadata = {
  title: "Raw Deals",
  description: "View the raw deals",
};

// After
type SearchParams = Promise<{ [key: string]: string | undefined }>;

const RawDealsPage = async (props: { searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;
  const search = searchParams?.query || "";
  const revenue = searchParams?.revenue || "";
  const location = searchParams?.location || "";
  const maxRevenue = searchParams?.maxRevenue || "";
  const maxEbitda = searchParams?.maxEbitda || "";
  const currentPage = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 50;
  const offset = (currentPage - 1) * limit;

  const ebitda = searchParams?.ebitda || "";
  const userId = searchParams?.userId || "";
  // Ensure dealTypes is always an array
  const dealTypes =
    typeof searchParams?.dealType === "string"
      ? [searchParams.dealType]
      : searchParams?.dealType || [];

  const { data, totalPages, totalCount } = await GetAllDeals({
    search,
    offset,
    limit,
    dealTypes: dealTypes as DealType[],
    ebitda,
    userId,
    revenue,
    location,
    maxRevenue,
    maxEbitda,
  });

  const currentUserRole = await getCurrentUserRole();

  return (
    <section className="block-space group container">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold md:mb-6 lg:mb-8">Raw Deals</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Browse through our collection of unprocessed deals gathered from
          various sources including manual entries, bulk uploads, external
          website scraping, and AI-inferred opportunities.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-medium">
            Total Deals: <span className="font-bold">{totalCount}</span>
          </h4>
          <div className="ml-4 rounded-md bg-primary/10 px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchEbitdaDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchRevenueDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchMaxRevenueDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchLocationDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchMaxEbitdaDeals />
          </Suspense>
        </div>
        <Suspense fallback={<DealTypeFilterSkeleton />}>
          <DealTypeFilter />
        </Suspense>
        <Suspense fallback={<DealTypeFilterSkeleton />}>
          <UserDealFilter />
        </Suspense>
      </div>

      <div className="group-has-[[data-pending]]:animate-pulse">
        {data.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-xl text-muted-foreground">
              No deals found matching your criteria.
            </p>
          </div>
        ) : (
          <DealContainer
            data={data}
            userRole={currentUserRole!}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
          />
        )}
      </div>
      <Pagination totalPages={totalPages} />
    </section>
  );
};

export default RawDealsPage;
