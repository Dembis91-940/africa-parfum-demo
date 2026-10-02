'use client';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {products} from '@/lib/catalog';

/**
 * Galerie africaine — architecture 3D vivante d’Africa Parfum.
 *
 * Ce n'est plus une pluie de particules devant un décor plat : le visiteur
 * traverse une suite de portiques architecturaux en pierre vert profond et
 * laiton, avec piliers, chapiteaux, nervures, plafond et sol incrusté.
 * Le scroll avance la caméra dans la galerie ; le pointeur change doucement
 * son orientation. L'architecture reste un décor de fond : aucun contenu
 * essentiel ne dépend de WebGL.
 */

type Gate = { group: THREE.Group; brass: THREE.MeshStandardMaterial; light: THREE.PointLight };

declare global {
  interface Window { __africaWorld3d?: { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera } }
}

const clamp = (v:number, a:number, b:number) => Math.max(a, Math.min(b, v));
const smooth = (a:number, b:number, x:number) => {
  const t = clamp((x-a)/(b-a),0,1);
  return t*t*(3-2*t);
};

function addMesh(group:THREE.Group, geometry:THREE.BufferGeometry, material:THREE.Material, x:number, y:number, z:number) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x,y,z);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  group.add(mesh);
  return mesh;
}

function makeGate(index:number, z:number, width:number, height:number, stone:THREE.MeshStandardMaterial, gold:THREE.MeshStandardMaterial): Gate {
  const group = new THREE.Group();
  group.position.z = z;
  const scale = 1 - index*0.085;
  group.scale.setScalar(scale);

  const half = width/2;
  const spring = height*0.62;
  const points = [
    new THREE.Vector3(-half,0.22,0), new THREE.Vector3(-half,spring*.58,0),
    new THREE.Vector3(-half*.94,spring*.88,0), new THREE.Vector3(-half*.72,height*.96,0),
    new THREE.Vector3(-half*.4,height,0), new THREE.Vector3(0,height*1.015,0),
    new THREE.Vector3(half*.4,height,0), new THREE.Vector3(half*.72,height*.96,0),
    new THREE.Vector3(half*.94,spring*.88,0), new THREE.Vector3(half,spring*.58,0),
    new THREE.Vector3(half,0.22,0),
  ];
  const archCurve = new THREE.CatmullRomCurve3(points);
  const arch = new THREE.TubeGeometry(archCurve,80,0.23,12,false);
  const trimCurve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p.x,p.y,p.z+0.18)));
  const trim = new THREE.TubeGeometry(trimCurve,80,0.033,8,false);
  const secondCurve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p.x,p.y,p.z-0.28)));
  const secondArch = new THREE.TubeGeometry(secondCurve,80,0.12,8,false);
  addMesh(group,arch,stone,0,0,0);
  const goldLine=addMesh(group,trim,gold,0,0,0);
  addMesh(group,secondArch,stone,0,0,0);

  /* Retours de profondeur reliant les deux parements du portique. */
  for (const side of [-1,1]) {
    const x=side*half;
    const returnBar=new THREE.Mesh(new THREE.BoxGeometry(.24,height*.64,.46),stone);
    returnBar.position.set(x,height*.32,-.05);
    group.add(returnBar);

    const shaftGeo=new THREE.CylinderGeometry(.22,.34,height*.63,12,1,false);
    const shaft=addMesh(group,shaftGeo,stone,x,height*.315,0);
    shaft.rotation.z=side*.012;

    const foot=addMesh(group,new THREE.CylinderGeometry(.42,.48,.18,16),gold,x,.12,.02);
    foot.scale.x=.9;
    addMesh(group,new THREE.CylinderGeometry(.32,.40,.16,16),stone,x,.27,.02);
    addMesh(group,new THREE.CylinderGeometry(.29,.34,.16,16),gold,x,height*.63,.02);
    addMesh(group,new THREE.CylinderGeometry(.38,.30,.22,16),stone,x,height*.63+.15,.02);
    addMesh(group,new THREE.CylinderGeometry(.43,.38,.07,16),gold,x,height*.63+.29,.02);

    /* Nervures verticales fines dans la pierre. */
    for(let rib=-1;rib<=1;rib++){
      const line=addMesh(group,new THREE.CylinderGeometry(.012,.012,height*.48,5),gold,x+rib*.105,height*.33,.235);
      line.material=(goldLine.material as THREE.Material);
    }
  }

  /* Frise basse d'incrustation, signature propre au lieu. */
  const lintel=addMesh(group,new THREE.BoxGeometry(width*.72,.1,.42),gold,0,spring*.92,.02);
  lintel.scale.x=1;
  lintel.material=gold;

  const lamp=new THREE.PointLight(0xe8bd79, index===0?8:5, 13, 2);
  lamp.position.set(0,height*.75,.72);
  group.add(lamp);

  return {group, brass:gold, light:lamp};
}

/** Vitrine rétro-éclairée : un flacon réel du catalogue présenté comme en boutique. */
function makeVitrine(x:number,z:number,tex:THREE.Texture,stone:THREE.MeshStandardMaterial,brass:THREE.MeshStandardMaterial): THREE.Group{
  const g=new THREE.Group();
  g.position.set(x,0,z);
  /* Face à l'entrée (diagonale couloir + entrée) : visible dès l'arrivée. */
  g.rotation.y=x<0?0.785:-0.785;
  const w=1.9,h=3.0,d=0.7;

  /* Alcôve éclairée : fond chaud qui fait ressortir le flacon. */
  addMesh(g,new THREE.BoxGeometry(w,h,0.14),new THREE.MeshStandardMaterial({color:0x241a0f,roughness:.5,metalness:.2,emissive:0xca8a38,emissiveIntensity:1.7}),0,h/2,-d/2+0.06);

  /* Socle laiton. */
  addMesh(g,new THREE.BoxGeometry(w,0.14,d),brass,0,0.07,0);

  /* Flacon réel, rétro-éclairé, face à l'entrée (plan +z par défaut). */
  const photo=new THREE.Mesh(new THREE.PlaneGeometry(1.3,2.0),new THREE.MeshBasicMaterial({map:tex,transparent:true}));
  photo.position.set(0,0.14+1.0,-d/2+0.16);
  g.add(photo);

  /* Armature dorée : montants + traverse haute (face avant). */
  addMesh(g,new THREE.BoxGeometry(0.06,h,0.06),brass,-w/2+0.06,h/2,d/2-0.01);
  addMesh(g,new THREE.BoxGeometry(0.06,h,0.06),brass,w/2-0.06,h/2,d/2-0.01);
  addMesh(g,new THREE.BoxGeometry(w,0.06,0.06),brass,0,h,d/2-0.01);

  /* Vitre avant. */
  addMesh(g,new THREE.BoxGeometry(w,h,0.06),new THREE.MeshStandardMaterial({color:0xd9f0e6,transparent:true,opacity:0.12,roughness:0.04,metalness:0.05}),0,h/2,d/2-0.03);

  return g;
}

export function ArchitecturalWorld(){
  const canvasRef=useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas) return;
    let renderer:THREE.WebGLRenderer;
    try{
      renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    }catch{return;}

    const scene=new THREE.Scene();
    scene.fog=new THREE.FogExp2(0x101b16,0.017);
    const camera=new THREE.PerspectiveCamera(46,1,.1,100);
    camera.position.set(0,2.75,10.6);
    camera.lookAt(0,2.85,-6.6);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
    renderer.setClearColor(0x101b16,0);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.28;
    renderer.outputColorSpace=THREE.SRGBColorSpace;

    scene.add(new THREE.AmbientLight(0xc7d1c2,1.8));
    const key=new THREE.DirectionalLight(0xf8e1b0,3.0);
    key.position.set(-3,8,6); scene.add(key);
    const rim=new THREE.DirectionalLight(0x93a885,1.5);
    rim.position.set(5,5,-12); scene.add(rim);

    const stone=new THREE.MeshStandardMaterial({color:0x41594a,roughness:.30,metalness:.42});
    const darkStone=new THREE.MeshStandardMaterial({color:0x1d2c24,roughness:.44,metalness:.22});
    const brass=new THREE.MeshStandardMaterial({color:0xdfb06b,roughness:.20,metalness:.96,emissive:0x5a3510,emissiveIntensity:.62});
    const inlay=new THREE.MeshStandardMaterial({color:0x8a744c,roughness:.26,metalness:.88,emissive:0x241505,emissiveIntensity:.3});

    /* Six portiques : perspective, profondeur, lumière et rythme architectural. */
    const gates:Gate[]=[];
    const gateSpecs=[
      {z:6.2,w:8.6,h:6.5},{z:1.2,w:7.5,h:5.7},{z:-3.8,w:6.4,h:4.95},
      {z:-8.8,w:5.4,h:4.3},{z:-13.8,w:4.5,h:3.7},{z:-18.8,w:3.7,h:3.15},
    ];
    gateSpecs.forEach((s,i)=>{
      const g=makeGate(i,s.z,s.w,s.h,stone,brass);
      scene.add(g.group); gates.push(g);
    });

    /* Sol d'atelier : dalles larges, joints fins, axe d'or dans la perspective. */
    const floor=addMesh(scene,new THREE.PlaneGeometry(44,76),darkStone,0,-.08,-8);
    floor.rotation.x=-Math.PI/2;
    const floorLines=new THREE.Group();
    for(let x=-19;x<=19;x+=2.1){
      const geom=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,.012,30),new THREE.Vector3(x,.012,-48)]);
      floorLines.add(new THREE.Line(geom,new THREE.LineBasicMaterial({color:0x8b754f,transparent:true,opacity:x===0?.5:.15})));
    }
    for(let z=-46;z<=30;z+=2.8){
      const geom=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-22,.016,z),new THREE.Vector3(22,.016,z)]);
      floorLines.add(new THREE.Line(geom,new THREE.LineBasicMaterial({color:0x8b754f,transparent:true,opacity:.11})));
    }
    scene.add(floorLines);

    /* Colonnes murales et travées latérales, lisibles aux bords de l'interface. */
    for(let z=3;z>=-25;z-=5.5){
      const scale=1-Math.max(0,-z)*.018;
      for(const side of [-1,1]){
        const x=side*(7.5+Math.max(0,-z)*.11);
        const pillar=addMesh(scene,new THREE.CylinderGeometry(.14*scale,.25*scale,4.8*scale,10),stone,x,2.4*scale,z);
        pillar.rotation.z=side*.025;
        addMesh(scene,new THREE.CylinderGeometry(.3*scale,.36*scale,.12*scale,12),brass,x,.12*scale,z);
        addMesh(scene,new THREE.CylinderGeometry(.28*scale,.2*scale,.15*scale,12),brass,x,4.82*scale,z);
      }
    }

    /* Vitrines : une vraie boutique — on longe des parfums en vitrine des deux côtés. */
    const baseDir=(()=>{const u=new URL(document.baseURI);let p=u.pathname;if(!p.endsWith('/'))p=p.slice(0,p.lastIndexOf('/')+1);return u.origin+p;})();
    const texLoader=new THREE.TextureLoader();
    const vitrineZ=[4.5,0.2,-4.3,-8.8];
    let vi=0;
    for(const vz of vitrineZ){
      for(const side of [-1,1]){
        const tex=texLoader.load(baseDir+products[vi%products.length].image);
        tex.colorSpace=THREE.SRGBColorSpace;
        scene.add(makeVitrine(side*2.8,vz,tex,stone,brass));
        vi++;
      }
    }

    /* Orbe de lumière au point de fuite, véritable repère de profondeur. */
    const coreMat=new THREE.MeshBasicMaterial({color:0xf0c982,transparent:true,opacity:.78});
    const core=new THREE.Mesh(new THREE.SphereGeometry(.19,24,16),coreMat);
    core.position.set(0,3,-27); scene.add(core);
    const coreHalo=new THREE.Mesh(new THREE.SphereGeometry(.38,20,14),new THREE.MeshBasicMaterial({color:0xc99d5c,transparent:true,opacity:.12,side:THREE.BackSide}));
    coreHalo.position.copy(core.position); scene.add(coreHalo);

    /* Fond chaud au point de fuite : les portiques se détachent dessus. */
    const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(70,44),new THREE.MeshBasicMaterial({color:0x2a1f13,transparent:true,opacity:.92}));
    backdrop.position.set(0,4.5,-29); scene.add(backdrop);

    const resize=()=>{
      const w=window.innerWidth,h=window.innerHeight;
      camera.aspect=w/Math.max(1,h); camera.updateProjectionMatrix();
      renderer.setSize(w,h,false);
    };
    resize(); window.addEventListener('resize',resize,{passive:true});

    let scroll=0,scrollV=0,px=0,py=0,pxV=0,pyV=0,frame=0,alive=true;
    const onScroll=()=>{scroll=window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)};
    const onMove=(e:MouseEvent)=>{px=e.clientX/Math.max(1,window.innerWidth)*2-1;py=e.clientY/Math.max(1,window.innerHeight)*2-1};
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('mousemove',onMove,{passive:true});
    onScroll();

    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const render=(time:number)=>{
      if(!alive)return;
      scrollV+= (scroll-scrollV)*(reduced.matches?0.16:0.045);
      pxV+=(px-pxV)*(reduced.matches?0:.035); pyV+=(py-pyV)*(reduced.matches?0:.035);
      const travel=scrollV*22;
      camera.position.x=pxV*.42;
      camera.position.y=2.65+pyV*.22+Math.sin(time*.00035)*.035;
      camera.position.z=10.6-travel;
      const lookZ=camera.position.z-10;
      camera.lookAt(pxV*.66,2.85+pyV*.18,lookZ);
      camera.rotation.z=-pxV*.008;
      gates.forEach((g,i)=>{
        const p=smooth(i*.16-.05,i*.16+.11,scrollV);
        g.light.intensity=(i===0?6:4.2)+p*3.4;
        g.group.rotation.y=Math.sin(time*.00022+i*.85)*.006+pxV*.012*(i%2?1:-1);
        g.brass.emissiveIntensity=.18+.28*(.5+.5*Math.sin(time*.0004+i*1.2));
      });
      core.scale.setScalar(.9+Math.sin(time*.001)*.16);
      renderer.render(scene,camera);
      frame=requestAnimationFrame(render);
    };
    frame=requestAnimationFrame(render);

    const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(frame)}else{frame=requestAnimationFrame(render)}};
    document.addEventListener('visibilitychange',onVisibility);
    window.__africaWorld3d={renderer,scene,camera};

    return()=>{
      alive=false; cancelAnimationFrame(frame);
      window.removeEventListener('resize',resize); window.removeEventListener('scroll',onScroll); window.removeEventListener('mousemove',onMove);
      document.removeEventListener('visibilitychange',onVisibility);
      delete window.__africaWorld3d;
      scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose()}});
      renderer.dispose(); stone.dispose();darkStone.dispose();brass.dispose();inlay.dispose();
    };
  },[]);

  return <canvas ref={canvasRef} className="ae-architecture" aria-hidden="true" />;
}
