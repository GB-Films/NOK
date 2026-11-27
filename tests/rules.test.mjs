import {test,before,after} from "node:test";
import {readFile} from "node:fs/promises";
import {initializeTestEnvironment,assertSucceeds,assertFails} from "@firebase/rules-unit-testing";
import {doc,getDoc,setDoc,collection,getDocs,writeBatch,Bytes,deleteDoc} from "firebase/firestore";
import {initializeApp,deleteApp} from "firebase/app";
import {getFirestore as lite,connectFirestoreEmulator} from "firebase/firestore/lite";
import {cloudWorld} from "../account/firebase.js";
import assert from "node:assert/strict";
let env;
before(async()=>{env=await initializeTestEnvironment({projectId:"demo-nok",firestore:{host:"127.0.0.1",port:8196,rules:await readFile(process.env.NOK_TEST_RULES || new URL("./firestore.rules",import.meta.url),"utf8")}});});
after(async()=>{await env?.cleanup();});
const login=(uid,verified=true,provider="google.com")=>env.authenticatedContext(uid,{email:uid+"@example.com",email_verified:verified,firebase:{sign_in_provider:provider,identities:{}}}).firestore();
const ref=(db,uid,id="state")=>doc(db,"nokPlayers",uid,"world",id);
test("la dueña guarda y recupera; ni otra cuenta, ni una sesión anónima o no verificada pueden acceder",async()=>{
  const db=login("alfa"), batch=writeBatch(db);
  batch.set(ref(db,"alfa"),{format:1,parts:1,version:1});
  batch.set(ref(db,"alfa","part-0"),{payload:Bytes.fromUint8Array(new Uint8Array([11])),version:1});
  await assertSucceeds(batch.commit());
  await assertSucceeds(getDoc(ref(db,"alfa","part-0")));
  for(const stranger of [login("beta"),env.unauthenticatedContext().firestore(),login("alfa",false),login("alfa",true,"password")]){
    await assertFails(getDoc(ref(stranger,"alfa"))); await assertFails(getDoc(ref(stranger,"alfa","part-0")));
    await assertFails(setDoc(ref(stranger,"alfa"),{format:1,parts:1,version:2}));
    await assertFails(deleteDoc(ref(stranger,"alfa","part-0")));
  }
  await assertFails(getDocs(collection(db,"nokPlayers","alfa","world")));
  await assertFails(setDoc(ref(db,"alfa"),{format:1,parts:1,version:1}));
  await assertFails(setDoc(ref(db,"alfa"),{format:1,parts:30,version:2}));
  await assertFails(setDoc(ref(db,"alfa","part-0"),{payload:"texto",version:1}));
  await assertFails(setDoc(ref(db,"alfa","unknown"),{format:1,parts:1,version:1}));
  await assertSucceeds(setDoc(ref(login("beta"),"beta"),{format:1,parts:1,version:1}));
});
test("el cliente real recupera el mundo en otra compu y no pisa cambios concurrentes",async()=>{
  const apps=[];
  const device=(id,uid,requested=uid)=>{
    const app=initializeApp({projectId:"demo-nok"},id); apps.push(app);
    const db=lite(app);
    connectFirestoreEmulator(db,"127.0.0.1",8196,{mockUserToken:{sub:uid,email:uid+"@example.com",email_verified:true,firebase:{sign_in_provider:"google.com",identities:{}}}});
    return cloudWorld(requested,db,()=>requested);
  };
  try {
    const a=device("uno","prueba"),b=device("dos","prueba"),outsider=device("tres","otro","prueba");
    const state={"nok-listas":"Tarea de prueba"};
    assert.deepEqual(await a.load(),{}); await a.save(state); assert.deepEqual(await b.load(),state);
    await a.save({"nok-listas":"Más reciente"});
    await assert.rejects(()=>b.save(state),{code:"nok/conflict"});
    await assert.rejects(()=>outsider.load(),{code:"permission-denied"});
    assert.deepEqual(await b.load(),{"nok-listas":"Más reciente"});
  } finally { await Promise.all(apps.map(deleteApp)); }
});
