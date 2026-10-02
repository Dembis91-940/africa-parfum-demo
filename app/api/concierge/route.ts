import {products} from '@/lib/catalog';
const headers={'Cache-Control':'no-store'};
export async function GET(){return Response.json({connected:!!(process.env.HERMES_BRIDGE_URL&&process.env.HERMES_BRIDGE_TOKEN)}, {headers})}
export async function POST(req:Request){
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'Origine refusée'},{status:403,headers});
 if(Number(req.headers.get('content-length')||0)>16000)return Response.json({error:'Message trop long'},{status:413,headers});
 const endpoint=process.env.HERMES_BRIDGE_URL,token=process.env.HERMES_BRIDGE_TOKEN;
 if(!endpoint||!token)return Response.json({error:'Cette présentation en ligne n’est pas encore reliée à Hermes. Le service doit être connecté pour permettre la conversation.'},{status:503,headers});
 try{const text=await req.text();if(text.length>16000)throw Error();const data=JSON.parse(text);if(typeof data.message!=='string'||!data.message.trim()||data.message.length>1000)throw Error();
 const result=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({message:data.message,history:Array.isArray(data.history)?data.history.slice(-6):[],currentProduct:products.some(p=>p.id===data.currentProduct)?data.currentProduct:null}),signal:AbortSignal.timeout(60000)});
 const answer=await result.json() as {error?:string;reply?:string;action?:string;productId?:string|null};if(!result.ok)return Response.json({error:typeof answer.error==='string'?answer.error:'Hermes est indisponible.'},{status:result.status,headers});
 if(typeof answer.reply!=='string'||!['show_product','open_details','show_collection','none'].includes(answer.action||'')||answer.productId&&!products.some(p=>p.id===answer.productId))throw Error();
 return Response.json({reply:answer.reply,action:answer.action,productId:answer.productId||null},{headers});
 }catch{return Response.json({error:'La connexion à Hermes a été interrompue. Réessayez ou explorez la collection.'},{status:503,headers})}
}
