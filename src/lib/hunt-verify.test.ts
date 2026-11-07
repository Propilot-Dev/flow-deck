import assert from "node:assert/strict";
import test from "node:test";
import { collectSourceUrls, offersFromSources, verifiedOffers } from "./hunt-verify.ts";

const SOURCE = "https://dcmotive.com/products/p/yamaha-xs650-mikuni-vm34-carburetor-kit";

test("une offre sans source est jetée", () => {
  const offers = verifiedOffers(
    [{ title: "Carbu inventé", price: "10 €", url: "https://exemple-invente.test/carbu" }],
    [SOURCE],
  );
  assert.equal(offers.length, 0);
});

test("une offre dont le lien a été lu est gardée", () => {
  const offers = verifiedOffers(
    [{ title: "Kit VM34 XS650", price: "511 $", meta: "Kit complet", url: SOURCE }],
    [SOURCE],
  );
  assert.equal(offers.length, 1);
  assert.equal(offers[0]?.url, SOURCE);
  assert.equal(offers[0]?.host, "dcmotive.com");
});

test("les pages lues deviennent des offres si le modèle ne renvoie pas de JSON", () => {
  const offers = offersFromSources([SOURCE, "http://insecure.test/x"]);
  assert.equal(offers.length, 1);
  assert.equal(offers[0]?.price, "Prix sur la page");
});

test("les sources sortent des appels de recherche", () => {
  const urls = collectSourceUrls([
    { type: "web_search_call", action: { sources: [{ url: SOURCE }, { url: "https://itm.ebaydesc.com/itmdesc/1" }] } },
  ]);
  assert.deepEqual(urls, [SOURCE]);
});
