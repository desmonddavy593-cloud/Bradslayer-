import {redirect} from 'next/navigation';import {readSession} from '@/lib/auth';import DeveloperNav from './nav';
export default function DeveloperLayout({children}:{children:React.ReactNode}){if(!readSession())redirect('/developers');return <div className="developer-portal"><DeveloperNav/>{children}</div>}
