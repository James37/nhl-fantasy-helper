import { Form } from "react-bootstrap";

export const handlePlayerClick = (player) => {
  const fullNameArray = player.skaterFullName.split(" ");
  const firstName = fullNameArray[0];
  const lastName = fullNameArray[fullNameArray.length - 1];
  const formattedName = `${firstName}-${lastName}-${player.playerId}`;
  const url = `https://www.nhl.com/player/${formattedName}`;
  window.open(url, "_blank");
};

const calculateAge = (birthDateString) => {
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate)) return "N/A"; // Handle invalid dates

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const hasBirthdayOccurred =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasBirthdayOccurred) {
    age--;
  }

  return age;
};

export const formatValue = (
  player,
  value,
  headerKey,
  compareList,
  setCompareList
) => {
  // SeasonId: Format bold for current season
  if (headerKey === "seasonId" && value) {
    return (
      <span className={value === 20232024 ? "fw-bold" : ""}>
        {value.toString().slice(2, 4)}-{value.toString().slice(6, 8)}
      </span>
    );
  }

  // Player Name: Clickable link
  if (headerKey === "skaterFullName") {
    return (
      <span className="player-name" onClick={() => handlePlayerClick(player)}>
        {value}
      </span>
    );
  }

  // Birthdate: Convert to age
  if (headerKey === "birthDate") {
    return <span>{calculateAge(value)}</span>;
  }

  // Show current team, if it's different
  if (headerKey === "teamAbbrevs") {
    if (value !== player.currentTeamAbbrev) {
      return (
        <span>
          {value} ({player.currentTeamAbbrev})
        </span>
      );
    }
  }

  // Compare: Checkbox for player comparison
  if (headerKey === "compare") {
    const playerIdSeason = player.playerId + player.seasonId;
    const checked = compareList.includes(playerIdSeason);

    return (
      <Form.Check
        type="checkbox"
        checked={checked}
        onChange={() => {
          setCompareList((prevList) =>
            checked
              ? prevList.filter((id) => id !== playerIdSeason)
              : [...prevList, playerIdSeason]
          );
        }}
      />
    );
  }

  // Handle null or NaN values
  if (value == null || value === "NaN") {
    return "";
  }

  // Format floating-point numbers
  if (typeof value === "number" && !Number.isInteger(value)) {
    return parseFloat(value.toFixed(headerKey === "savePct" ? 3 : 2));
  }

  return value;
};
