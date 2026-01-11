import Link from "next/link";
import Container from "../components/container";

const Page = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-4 lg:p-24 pb-40 font-open-sans">
      <Container>
        <div className="md:w-2/3 m-auto ">
          <p className="text-xl text-center py-8">Try our tools </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/numerology">
              <p className="w-fit text-white dark:text-black p-4 text-center bg-slate-900 dark:bg-white rounded-md  uppercase font-open-sans font-extralight tracking-widest hover:-translate-y-1 hover:bg-lime-950">
                Numerology 🔢
              </p>
            </Link>
            <Link href="/feng-shui">
              <p className="w-fit p-4 text-white dark:text-black text-center bg-slate-900 dark:bg-white rounded-md  uppercase font-open-sans font-extralight tracking-widest hover:-translate-y-1 hover:bg-lime-950">
                Feng Shui 🌟
              </p>
            </Link>
            <Link href="/transits">
              <p className="w-fit p-4 text-white dark:text-black text-center bg-slate-900 dark:bg-white rounded-md  uppercase font-open-sans font-extralight tracking-widest hover:-translate-y-1 hover:bg-lime-950">
                Transists ♈
              </p>
            </Link>
          </div>
        </div>
      </Container>
      <p className="text-xl text-center py-8">Pheydrus Tools 2024</p>
    </div>
  );
};
export default Page;
