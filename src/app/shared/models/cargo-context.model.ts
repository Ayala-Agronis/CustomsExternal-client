export type CargoKey = {
  cargoType: string;
  firstCargoID: string;
  secondCargoID: string;
  thirdCargoID?: string;
};

export type CargoContext = {
  decId: string;
  key: CargoKey;
  createDate?: string; // res.cargosVersionField[0].createDateField
  receivedAtIso: string; // מתי קיבלנו את התשובה
};