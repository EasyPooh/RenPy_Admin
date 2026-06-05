import React from "react";
import { useParams } from "react-router-dom";

const AssetPage = () => {
  const { id } = useParams();
  return <div>AssetPage ID: {id}</div>;
};

export default AssetPage;
