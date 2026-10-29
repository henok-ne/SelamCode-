import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { aggregateResearch } from "@/lib/research";
import { ResearchDashboard } from "@/components/research-dashboard";
import { ResearchAccess } from "@/components/research-access";
import { Footer } from "@/components/footer";
export const metadata: Metadata = { title: "The research notebook" };
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const user=await getUser();
  if(user?.role!=="instructor")return <><ResearchAccess/><Footer/></>;
  const submissions=await db.submission.findMany({include:{exercise:true,user:{select:{id:true,passwordHash:true}},hints:{include:{feedback:true}}},orderBy:{createdAt:"asc"}});
  return <><ResearchDashboard initialData={aggregateResearch(submissions,process.env.RESEARCH_SALT || "")}/><Footer/></>;
}
