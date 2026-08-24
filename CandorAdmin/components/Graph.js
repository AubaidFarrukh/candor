import ReactApexChart from "react-apexcharts";

import {
  USERS_GRAPH,
  ACTIVE_USERS_GRAPH,
  CONTENTS_GRAPH,
} from "../graphQL/queries";
import { useQuery } from "@apollo/client";
import { useEffect, useState, useContext } from "react";
import getArray from "../functions/getArray";

export default function Graph({ filter }) {
  const [values, setvalues] = useState([]);
  const [activeUsers, setactiveUsers] = useState([]);
  const [contents, setcontents] = useState([]);

  const userData = useQuery(USERS_GRAPH);
  const activeuserData = useQuery(ACTIVE_USERS_GRAPH);
  const contentsGraph = useQuery(CONTENTS_GRAPH);

  useEffect(() => {
    if (values.length == 0 && activeUsers.length == 0 && contents.length == 0) {
    }

    if (userData.data) {
      // console.log(userData.data.AdminUserGraph);
      // let vals = getArray(userData.data.AdminUserGraph?.years);
      // setvalues([...vals]);
      // console.log(vals);
    }
    if (userData.error) {
      // console.log(userData.error.message);
    }

    if (activeuserData.data) {
      // console.log(activeuserData?.data?.AdminActiveUsersGraph);
      // let vals = getArray(activeUsers.data?.AdminActiveUsersGraph?.years);
      // setactiveUsers([...vals]);
      // console.log(vals);
    }
    if (activeuserData.error) {
      // console.log(activeuserData.error.message);
    }

    if (contentsGraph.data) {
      // console.log(contentsGraph.data?.AdminContentCreatedGraph);
      let vals = getArray(contentsGraph.data?.AdminContentCreatedGraph.years);
      setcontents([...vals]);
      console.log(vals);
    }
    if (contentsGraph.error) {
      // console.log(contentsGraph.error.message);
    }
  }, [contentsGraph.data, activeuserData.data, userData.data]);

  const series = [
    {
      name: "Total users in Candor",
      data: filter == 1 || filter == 2 ? values : [],
    },
    {
      name: "Active users in Candor",
      data: filter == 1 || filter == 3 ? activeUsers : [],
    },
    {
      name: "Contents created in Candor",
      data: filter == 1 || filter == 4 ? contents : [],
    },
  ];

  const options = {
    chart: {
      height: 350,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    markers: {
      size: 0,
    },
    xaxis: {
      type: "category",
      labels: {
        show: true,
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        showDuplicates: false,
        trim: false,
        minHeight: undefined,
        maxHeight: 120,
        style: {
          colors: "#9b9b9b",
          fontSize: "9px",
          fontFamily: "Rubik",
          fontWeight: 500,
          cssClass: "apexcharts-xaxis-label",
        },
      },
    },
    yaxis: {
      labels: {
        show: true,
        rotateAlways: false,
        hideOverlappingLabels: true,
        showDuplicates: false,
        trim: false,
        minHeight: undefined,
        maxHeight: 120,
        style: {
          colors: "#9b9b9b",
          fontSize: "9px",
          fontFamily: "Rubik",
          fontWeight: 500,
          cssClass: "apexcharts-xaxis-label",
        },
      },
    },
    enabledOnSeries: false,
    followCursor: false,
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        return `<div class="tool">
    <text class="thead">${series[seriesIndex][dataPointIndex]}</text>
      <text class="ttext space">Total User in B.Social </text>

      <text style="color: #27d86b" class="thead">${series[1][dataPointIndex]}</text>
      <text class="ttext space">Total Active User in B.Social </text>

      <text style="color: orange" class="thead">${series[2][dataPointIndex]}</text>
      <text class="ttext">Total Contents created in B.Social </text>
  </div>`;
      },
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="area"
      height={"85%"}
    />
  );
}
