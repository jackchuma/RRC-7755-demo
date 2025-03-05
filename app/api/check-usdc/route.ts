import { NextRequest, NextResponse } from "next/server";
import { checkUserHasUSDC } from "@/app/lib/checkUserHasUSDC";
import { Address } from "viem";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  try {
    const hasUSDC = await checkUserHasUSDC(address as Address);

    return NextResponse.json({ hasUSDC });
  } catch (error) {
    console.error("Error checking if user has USDC:", error);
    return NextResponse.json(
      { error: "Failed to check USDC balance" },
      { status: 500 }
    );
  }
}
