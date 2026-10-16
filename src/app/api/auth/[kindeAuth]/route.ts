import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ kindeAuth: string }> }
) {
	const { kindeAuth } = await params;
	return handleAuth(request, kindeAuth);
}