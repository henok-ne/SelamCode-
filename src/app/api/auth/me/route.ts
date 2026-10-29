import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
export async function GET() { try { return NextResponse.json({ user: await getUser() }); } catch (error) { return apiError(error); } }
