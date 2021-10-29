import Head from 'next/head'
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div >
      <Head>
        <title>App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar/>
    </div>
  )
}
