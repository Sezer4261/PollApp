@Component({
  selector: 'app-product-detail',
  imports: [],
  templateUrl: `./product-detail.html`,
  styleUrls: [`./product-detail.css`]
})
export class ProductDetail {
  detail = {
    "name": "Gaming Maus",
    "description": "Die Gaming Maus ist ein hochwertiges Eingabegerät, das speziell für Gamer entwickelt wurde. Sie bietet eine präzise Steuerung, ergonomisches Design und anpassbare Tastenbelegung, um das Spielerlebnis zu verbessern.",
    "specs": "dpi: 16000, Gewicht: 120g, Kabellänge: 2m, RGB-Beleuchtung",
    "stock": 25,
    "price": 59.99,
    "image": "https://example.com/images/gaming-maus.jpg"
  }
}

ngOnInit() {
  // This method is called when the component is initialized.
  // You can perform any necessary setup or data fetching here.
  console.log('ProductDetail component initialized with detail:', this.detail);
}