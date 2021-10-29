import Head from 'next/head'
import Navbar from "../components/Navbar";
import Game from "../Game/Game";

export default function Home() {
  return (
    <div className="bg-black h-screen">
      <Head>
        <title>App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar/>
      <Game />
    </div>
  )
}
