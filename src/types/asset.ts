export type AssetList = {
  assetPrice: string;
  assetStatus: string;
  assetURL: string;
  category: string;
  description: string;
  id: string;
  licenseID: string;
  name: string;
  nftDetails: NftDetails;
  nftFractionalizationDetails: any;
};

type NftDetails = {
  nftBlockMint: string;
  nftCollectionID: string;
};
