import { initializeApp } from "firebase/app";
import { browserPopupRedirectResolver, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { createNokAuth } from "./auth.js";
import { getFirestore, doc, getDoc, runTransaction, Bytes } from "firebase/firestore/lite";
import { encode, decode, maxParts } from "./storage.js";

// Public Firebase Web client identifiers, shared with GB Studio. They do not grant database access.
const app = initializeApp({
  apiKey: "AIzaSyA3P9BED7L2tGgHvcx3mseopDYXG4INkFE",
  authDomain: "gb-studio-260bc.firebaseapp.com", projectId: "gb-studio-260bc",
  appId: "1:475470109485:web:c4400a214f973223aa91a4"
}, "nok-web");
export const auth = createNokAuth(app);
export async function login() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({prompt:"select_account"});
  await signInWithPopup(auth, provider, browserPopupRedirectResolver);
}
export const logout = () => signOut(auth);
export function cloudWorld(uid, db = getFirestore(app), currentUid = () => auth.currentUser?.uid) {
  const ref = id => doc(db, "nokPlayers", uid, "world", id);
  const owner = () => { if (currentUid() !== uid) throw Error("La sesión cambió."); };
  let rev = 0, previousParts = 0;
  return {
    async load() {
      owner();
      for (let i=0; i<3; i++) {
        const header = await getDoc(ref("state"));
        if (!header.exists()) return {};
        const {version, parts, format} = header.data();
        if (format !== 1 || !Number.isSafeInteger(version) || version < 1 || !Number.isInteger(parts) || parts < 1 || parts > maxParts) throw Error("Formato de partida desconocido.");
        const list = await Promise.all(Array.from({length:parts}, (_,j) => getDoc(ref("part-"+j))));
        if (list.some(p => !p.exists() || p.data().version !== version)) continue;
        const data = await decode(list.map(p => p.data().payload.toUint8Array()));
        owner(); rev = version; previousParts = parts; return data;
      }
      throw Error("La partida cambió durante la carga. Volvé a entrar.");
    },
    async save(data) {
      owner();
      const pieces = await encode(data);
      const version = rev + 1;
      await runTransaction(db, async tx => {
        owner();
        const current = await tx.get(ref("state"));
        if ((current.exists() ? current.data().version : 0) !== rev)
          throw Object.assign(Error("Otra pestaña o dispositivo ya guardó una versión más nueva."),{code:"nok/conflict"});
        pieces.forEach((p,i) => tx.set(ref("part-"+i), {version, payload:Bytes.fromUint8Array(p)}));
        for (let j=pieces.length;j<previousParts;j++) tx.delete(ref("part-"+j));
        tx.set(ref("state"), {version, parts:pieces.length, format:1});
      });
      rev = version; previousParts = pieces.length;
    }
  };
}
