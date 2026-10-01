'use client';
import {Player} from '@remotion/player';
import {AbsoluteFill,interpolate,useCurrentFrame} from 'remotion';
function Notes({notes}:{notes:string[]}){const frame=useCurrentFrame();return <AbsoluteFill style={{justifyContent:'center',fontFamily:'Georgia',color:'#e7d2a3'}}>{notes.slice(0,3).map((n,i)=><div key={n} style={{fontSize:25,opacity:interpolate(frame,[i*18,i*18+24],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),translate:`${interpolate(frame,[i*18,i*18+24],[20,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}px 0`,padding:'8px 0'}}>{String(i+1).padStart(2,'0')} &nbsp; {n}</div>)}</AbsoluteFill>}
export function NotesMotion({notes}:{notes:string[]}){return <Player key={notes.join()} component={Notes} inputProps={{notes}} durationInFrames={150} fps={30} compositionWidth={450} compositionHeight={165} style={{width:'100%'}} autoPlay initiallyMuted controls={false} acknowledgeRemotionLicense/>}
