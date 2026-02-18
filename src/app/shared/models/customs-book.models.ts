export interface CustomsBookSearchResult {
  customsItemID: number;
  fullClassification: string;
  goodsDescription: string;
}

export interface TariffLine {
  tariffID: number;
  startDate: string;
  endDate: string;

  tradeAgreementID?: number | null;
  tradeAgreementTitle?: string | null;

  quotaID?: number | null;
  quotaTitle?: string | null;

  withoutQuota_ComputationMethodDataID?: number | null;
  withoutQuota_CalculationReference?: string | null;
  withoutQuota_OptionalTaxAddition?: number | null;

  withinQuota_ComputationMethodDataID?: number | null;
  withinQuota_CalculationReference?: string | null;
  withinQuota_OptionalTaxAddition?: number | null;
}

export interface RegularityLine {
  regularityRequirementID: number;
  startDate: string;
  endDate: string;

  regularitySourceCodeID: number;
  regularitySourceName?: string | null;

  regularityPublicationCodeID: number;
  regularityPublicationName?: string | null;

  importType?: 'personal' | 'commercial' | string;

  requirementGoodsDescription?: string | null;

  confirmationTypeID: number;
  confirmationTypeName?: string | null;

  authorityID: number;
  authorityName?: string | null;

  textualCondition?: string | null;
  trNumber?: number | null;
}

export interface CustomsBookDetails {
  customsItemID: number;
  fullClassification: string;
  goodsDescription: string;

  customsBookTypeIDNum?: number | null;
  customsBookTypeName?: string | null;

  partCustomsItemID?: number | null;
  partDescription?: string | null;

  chapterCustomsItemID?: number | null;
  chapterDescription?: string | null;

  measurementUnitID?: number | null;
  measurementUnitName?: string | null;

  tariffs: TariffLine[];
  regularities: RegularityLine[];
}
