import React from "react";
import { InferNewDealComponent } from "./InferDealComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infer a New Deal",
  description: "Source a New Deal Using AI",
};

const InferDealPage = async () => {
  return (
    <div>
      <InferNewDealComponent />
    </div>
  );
};

export default InferDealPage;
