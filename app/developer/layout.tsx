import {redirect} from 'next/navigation';import {readSession} from '@/lib/auth';
export default function DeveloperLayout({children}:{children:React.ReactNode}){if(!readSession())redirect('/developers');return <div className="developer-portal">{children}</div>}
