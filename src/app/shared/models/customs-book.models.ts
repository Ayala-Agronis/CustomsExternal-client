export interface CustomsBookLastUpdate {
  CustomsBookUpdateDate: string | null;
}

export interface CustomsBookSearchResult {
  CustomsItemID: number;
  FullClassification: string;
  GoodsDescription: string;

  MeasurementUnitName?: string;
  CalculationReference?: string;
  OptionalTaxAddition?: number;
}

export interface TariffLine {
  TariffID: number;
  StartDate: string;
  EndDate: string;

  TradeAgreementID?: number | null;
  TradeAgreementTitle?: string | null;

  QuotaID?: number | null;
  QuotaTitle?: string | null;

  WithoutQuota_ComputationMethodDataID?: number | null;
  WithoutQuota_CalculationReference?: string | null;
  WithoutQuota_OptionalTaxAddition?: number | null;

  WithinQuota_ComputationMethodDataID?: number | null;
  WithinQuota_CalculationReference?: string | null;
  WithinQuota_OptionalTaxAddition?: number | null;
}

export interface RegularityLine {
  RegularityRequirementID: number;
  StartDate: string;
  EndDate: string;

  RegularitySourceCodeID: number;
  RegularitySourceName?: string | null;

  RegularityPublicationCodeID: number;
  RegularityPublicationName?: string | null;

  ImportType?: 'personal' | 'commercial' | string;

  RequirementGoodsDescription?: string | null;

  ConfirmationTypeID: number;
  ConfirmationTypeName?: string | null;

  AuthorityID: number;
  AuthorityName?: string | null;

  TextualCondition?: string | null;
  TrNumber?: number | null;
}

export interface CustomsBookDetails {
  CustomsItemID: number;
  FullClassification: string;
  GoodsDescription: string;

  CustomsBookTypeIDNum?: number | null;
  CustomsBookTypeName?: string | null;

  PartCustomsItemID?: number | null;
  PartDescription?: string | null;

  ChapterCustomsItemID?: number | null;
  ChapterDescription?: string | null;

  MeasurementUnitID?: number | null;
  MeasurementUnitName?: string | null;

  Tariffs: TariffLine[];
  Regularities: RegularityLine[];
}
