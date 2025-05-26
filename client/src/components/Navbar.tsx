import Link from "next/link";
import Image from "next/image";
import title from "@/assets/medmatch_.svg";
import { Button } from "@/components/ui/button"


function Navbar() {
  return (
    <div className="bg-[#ffffff] shadow-md flex justify-between items-center py-2 px-4 gap-8 pl-10 pr-10">
      <div className="flex items-center">
        <Link href="/">
          <Image
            src={title}
            alt="Home link"
            width={200}
            height={100}
          />
        </Link>
      </div>
      <ul className="flex items-center p-0 m-0 list-none gap-4">
        <li>
          <Link href="/" className="text-primary-blue text-lg pr-10 font-semibold">Sign In</Link>
        </li>
        <li>
          <Button className="w-36 h-12 text-lg font-semibold bg-primary-blue hover:bg-[#ffffff] hover:text-primary-blue hover:outline hover:outline-primary-blue hover:outline-[2]">
            <span>Sign Up</span>
          </Button>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;
