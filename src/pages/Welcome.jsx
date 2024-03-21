import { useEffect, useState } from "react";
import { TbAmbulance } from "react-icons/tb";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { VictoryPie, VictoryLabel } from "victory";
import axios from "axios";
import View from "../components/modal/View";
import Cookies from "js-cookie";
import ReportCard from "../components/cards/ReportCard";

const Welcome = () => {
  const token = Cookies.get("token");
  const [crimeData, setCrimeData] = useState([]);
  const [accidentData, setAccidentData] = useState([]);
  const [unSolvedCrimeData, setUnSolvedCrimeData] = useState([]);
  const [solvedCrimeData, setSolvedCrimeData] = useState([]);
  const [unSolvedAccidentData, setUnSolvedAccidentData] = useState([]);
  const [solvedAccidentData, setSolvedAccidentData] = useState([]);
  const [arsonData, setArsonData] = useState([]);
  const [hazardData, setHazardData] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState("month");
  useEffect(() => {
    getCrimes();
    getAccidents();
    getArsons();
    getHazards();
    getUnsolvedCrime();
    getSolvedCrime();
    getUnsolvedAccident();
    getSolvedAccident();
  }, []);

  const getCrimes = () => {
    axios
      .get(`${import.meta.env.VITE_CRS_API_KEY}/api/reports/crimes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((result) => {
        setCrimeData(result.data);
      })
      .catch((err) => console.log(err));
  };

  const getAccidents = () => {
    axios
      .get(`${import.meta.env.VITE_CRS_API_KEY}/api/reports/accidents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((result) => {
        setAccidentData(result.data);
      })
      .catch((err) => console.log(err));
  };

  const getArsons = () => {
    axios
      .get(`${import.meta.env.VITE_CRS_API_KEY}/api/reports/arsons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((result) => {
        setArsonData(result.data);
      })
      .catch((err) => console.log(err));
  };

  const getHazards = () => {
    axios
      .get(`${import.meta.env.VITE_CRS_API_KEY}/api/reports/hazards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((result) => {
        setHazardData(result.data);
      })
      .catch((err) => console.log(err));
  };

  const getUnsolvedCrime = () => {
    axios
      .get(`${import.meta.env.VITE_CRS_API_KEY}/api/reports/crimes/unsolved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((result) => {
        console.log("Unsolved Crime:", result.data);
        setUnSolvedCrimeData(result.data);
      })
      .catch((err) => console.log(err));
  };

  const getSolvedCrime = () => {
    axios
      .get(`${import.meta.env.VITE_CRS_API_KEY}/api/reports/crimes/solved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((result) => {
        console.log("Solved  Crime: ", result.data);
        setSolvedCrimeData(result.data);
      })
      .catch((err) => console.log(err));
  };

  const getUnsolvedAccident = () => {
    axios
      .get(
        `${import.meta.env.VITE_CRS_API_KEY}/api/reports/accidents/unsolved`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((result) => {
        console.log("Unsolved Accident:", result.data);
        setUnSolvedAccidentData(result.data);
      })
      .catch((err) => console.log(err));
  };

  const getSolvedAccident = () => {
    axios
      .get(`${import.meta.env.VITE_CRS_API_KEY}/api/reports/accidents/solved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((result) => {
        console.log("Solved  Accident: ", result.data);
        setSolvedAccidentData(result.data);
      })
      .catch((err) => console.log(err));
  };

  const combineData = () => {
    const combinedData = [];
    const allCrimeData = [...solvedCrimeData, ...unSolvedCrimeData];
    const allAccidentData = [...solvedAccidentData, ...unSolvedAccidentData];

    let groupedData = {};

    if (filterCriteria === "month") {
      groupedData = groupDataByMonth(allCrimeData, allAccidentData);
      const allMonths = Object.keys(groupedData);
      const currentYear = new Date().getFullYear();
      const monthsInYear = 12;
      for (let i = 0; i < monthsInYear; i++) {
        const monthName = new Date(currentYear, i).toLocaleString("default", {
          month: "long",
        });
        if (!allMonths.includes(monthName)) {
          groupedData[monthName] = {
            solvedCrime: 0,
            unSolvedCrime: 0,
            solvedAccident: 0,
            unSolvedAccident: 0,
          };
        }
      }
    } else if (filterCriteria === "day") {
      groupedData = groupDataByDay(allCrimeData, allAccidentData);
      const allDays = Object.keys(groupedData);

      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      for (let i = 0; i < weekdays.length; i++) {
        const dayName = weekdays[i];
        if (!allDays.includes(dayName)) {
          groupedData[dayName] = {
            solvedCrime: 0,
            unSolvedCrime: 0,
            solvedAccident: 0,
            unSolvedAccident: 0,
          };
        }
      }
    } else if (filterCriteria === "year") {
      groupedData = groupDataByYear(allCrimeData, allAccidentData);
    }

    Object.keys(groupedData).forEach((key) => {
      combinedData.push({
        date: key,
        ...groupedData[key],
      });
    });

    return combinedData;
  };

  const groupDataByMonth = (crimeData, accidentData) => {
    const groupedData = {};

    const allDates = [
      ...new Set(
        crimeData
          .map((item) => item.date)
          .concat(accidentData.map((item) => item.date))
      ),
    ];
    allDates.forEach((date) => {
      const month = new Date(date).toLocaleString("default", { month: "long" });
      if (!groupedData[month]) {
        groupedData[month] = {
          solvedCrime: 0,
          unSolvedCrime: 0,
          solvedAccident: 0,
          unSolvedAccident: 0,
        };
      }

      groupedData[month].solvedCrime += countSolvedCrimesOnDate(date);
      groupedData[month].unSolvedCrime += countUnsolvedCrimesOnDate(date);
      groupedData[month].solvedAccident += countSolvedAccidentsOnDate(date);
      groupedData[month].unSolvedAccident += countUnsolvedAccidentsOnDate(date);
    });

    return groupedData;
  };

  const groupDataByDay = (crimeData, accidentData) => {
    const groupedData = {};

    const allDates = [
      ...new Set(
        crimeData
          .map((item) => item.date)
          .concat(accidentData.map((item) => item.date))
      ),
    ];
    allDates.forEach((date) => {
      const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      if (!groupedData[dayOfWeek]) {
        groupedData[dayOfWeek] = {
          solvedCrime: 0,
          unSolvedCrime: 0,
          solvedAccident: 0,
          unSolvedAccident: 0,
        };
      }

      groupedData[dayOfWeek].solvedCrime += countSolvedCrimesOnDate(date);
      groupedData[dayOfWeek].unSolvedCrime += countUnsolvedCrimesOnDate(date);
      groupedData[dayOfWeek].solvedAccident += countSolvedAccidentsOnDate(date);
      groupedData[dayOfWeek].unSolvedAccident +=
        countUnsolvedAccidentsOnDate(date);
    });

    return groupedData;
  };

  const groupDataByYear = (crimeData, accidentData) => {
    const groupedData = {};

    const allDates = [
      ...new Set(
        crimeData
          .map((item) => item.date)
          .concat(accidentData.map((item) => item.date))
      ),
    ];
    allDates.forEach((date) => {
      const year = new Date(date).getFullYear();
      if (!groupedData[year]) {
        groupedData[year] = {
          solvedCrime: 0,
          unSolvedCrime: 0,
          solvedAccident: 0,
          unSolvedAccident: 0,
        };
      }

      groupedData[year].solvedCrime += countSolvedCrimesOnDate(date);
      groupedData[year].unSolvedCrime += countUnsolvedCrimesOnDate(date);
      groupedData[year].solvedAccident += countSolvedAccidentsOnDate(date);
      groupedData[year].unSolvedAccident += countUnsolvedAccidentsOnDate(date);
    });

    return groupedData;
  };

  const countSolvedCrimesOnDate = (date) => {
    return solvedCrimeData.filter((item) => item.date === date).length;
  };

  const countUnsolvedCrimesOnDate = (date) => {
    return unSolvedCrimeData.filter((item) => item.date === date).length;
  };

  const countSolvedAccidentsOnDate = (date) => {
    return solvedAccidentData.filter((item) => item.date === date).length;
  };

  const countUnsolvedAccidentsOnDate = (date) => {
    return unSolvedAccidentData.filter((item) => item.date === date).length;
  };

  const totalCrime = crimeData.length;
  const totalAccident = accidentData.length;
  const totalArson = arsonData.length;
  const totalHazard = hazardData.length;

  const totalSolvedCrime = crimeData.filter(
    (crime) => crime.action_status === "Solved"
  ).length;
  
  const totalSolvedAccident = accidentData.filter(
    (crime) => crime.action_status === "Solved"
  ).length;
 

  const totalSolvedArson = arsonData.filter(
    (crime) => crime.action_status === "Solved"
  ).length;
  

  const totalSolvedHazard = hazardData.filter(
    (crime) => crime.action_status === "Solved"
  ).length;
  const totalOngoingCrimes = crimeData.filter(
  (crime) => crime.action_status === "InProgress" || crime.action_status === "Pending"
).length;

const totalOngoingAccident = accidentData.filter(
  (crime) => crime.action_status === "InProgress" || crime.action_status === "Pending"
).length;

const totalOngoingArson = arsonData.filter(
  (crime) => crime.action_status === "InProgress" || crime.action_status === "Pending"
).length;

const totalOngoingHazard = hazardData.filter(
  (crime) => crime.action_status === "InProgress" || crime.action_status === "Pending"
).length;

  return (
    <main className="p-2">
      <div className="main-title font-semibold mb-2 mt-4">
        <h3 className="text-white">Admin Dashboard</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        <ReportCard
          label="Accident"
          totalReport={totalAccident}
          totalSolvedReport={totalSolvedAccident}
          totalOngoingReports={totalOngoingAccident}
        />

        <ReportCard
          label="Arson"
          totalReport={totalArson}
          totalSolvedReport={totalSolvedArson}
          totalOngoingReports={totalOngoingArson}
        />

        <ReportCard
          label="Crime"
          totalReport={totalCrime}
          totalSolvedReport={totalSolvedCrime}
          totalOngoingReports={totalOngoingCrimes}
        />

        <ReportCard
          label="Hazard"
          totalReport={totalHazard}
          totalSolvedReport={totalSolvedHazard}
          totalOngoingReports={totalOngoingHazard}
        />
      </div>
      <div className="text-xl font-semibold m-3 text-white">
        <label htmlFor="filterCriteria">Filter Graph Criteria: </label>
        <select
          id="filterCriteria"
          value={filterCriteria}
          onChange={(e) => setFilterCriteria(e.target.value)}
          className="bg-[#191919] text-white rounded p-2"
        >
          <option value="month">Month</option>
          <option value="day">Day</option>
          <option value="year">Year</option>
        </select>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
        <div className="flex flex-col gap-3">
          <div className="crime-chart bg-[#191919] rounded-lg p-2">
            <h2 className="text-xl m-2 font-semibold">Crime</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={combineData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="solvedCrime" name="Solved Crime" fill="#8884d8" />
                <Bar
                  dataKey="unSolvedCrime"
                  name="Unsolved Crime"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="accident-chart bg-[#191919] rounded-lg p-2">
            <h2 className="text-xl m-2 font-semibold">Accident</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={combineData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="solvedAccident"
                  name="Solved Accident"
                  fill="#8884d8"
                />
                <Bar
                  dataKey="unSolvedAccident"
                  name="Unsolved Accident"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full">
          <div className="bg-[#191919] rounded-lg p-2 w-full">
            <h2 className="text-xl m-2 font-semibold">Recent User Reports: </h2>
            {crimeData
              .slice(-5)
              .reverse()
              .map((crime, index) => (
                <div
                  key={index}
                  className="flex flex-row justify-between  items-center p-2 border-b-2"
                >
                  <div>
                    <h4 className="text-2xl font-semibold">{crime.type}</h4>
                    <h4 className="font-semibold">{`${crime.location.barangay}, ${crime.location.municipality}`}</h4>
                  </div>
                  <View id={crime._id} />
                </div>
              ))}
          </div>
          <div className=" mt-4 justify-center text-4x text-white text-justify">
            <h5 className="mt-4 text-2xl">
              We are proud to present a platform specifically designed to
              provide up-to-date information on crime and accident data. Our
              goal is to provide easy and transparent access to relevant data,
              so you can understand and explore trends, patterns and statistics
              related to crime and accidents.
            </h5>
            <h5 className="mt-4 text-2xl">
              Through this website, you can explore various types of crime,
              including street crime, robbery, theft, and more. We also provide
              information regarding traffic accidents, road incidents, and other
              accident data that can help you understand the factors that
              contribute to accidents and take appropriate preventive measures.
            </h5>
            <h5 className="mt-4 text-2xl">
              We collect data from various reliable sources and we continuously
              update the information to keep it accurate and useful. We hope
              that through easy access to this data, the public can raise
              awareness of the problem of crime and accidents and contribute to
              creating a safer and better environment for all.
            </h5>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Welcome;
