import { auth } from "@/auth";
import { getAllScreeners } from "@/lib/queries";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
  title: "Screener",
  description: "Screener",
};

const Screenrs = async () => {
  const userSession = await auth();

  if (!userSession) redirect("/login");

  const screeners = await getAllScreeners();
  return (
    <div className="block-space big-container">
      <div>
        {screeners?.map((screener) => (
          <div key={screener.id}>{screener.name}</div>
        ))}
      </div>
    </div>
  );
};

export default Screenrs;
