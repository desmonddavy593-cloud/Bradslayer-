import {NextResponse} from 'next/server';import {prisma} from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){try{return NextResponse.json(await prisma.guide.findMany({orderBy:{createdAt:'desc'}}))}catch{return NextResponse.json([])}}
