import {prisma} from './db';
export async function notifyAdmin(type:string,title:string,body:string,link?:string){try{return await prisma.adminNotification.create({data:{type,title,body,link}})}catch{return null}}
