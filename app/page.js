import Image from "next/image";
import styles from "./page.module.css";
import ProductCatalogue from "./pages/productCatalogue/page";
import Orders from "./pages/orders/page";
import 'bootstrap/dist/css/bootstrap.css';

export default function Home() {
  return (
    //  <div><ProductCatalogue/></div>
    <div><Orders /></div>
  );
}
