import { Form } from "react-bootstrap";

export const handlePlayerClick = (player) => {
  const fullNameArray = player.skaterFullName.split(" ");
  const firstName = fullNameArray[0];
  const lastName = fullNameArray[fullNameArray.length - 1];
  const formattedName = `${firstName}-${lastName}-${player.playerId}`;
  const url = `https://www.nhl.com/player/${formattedName}`;
  window.open(url, "_blank");
};

export const formatValue = (
  player,
  value,
  headerKey,
  compareList,
  setCompareList
) => {
  if (headerKey === "seasonId" && value) {
    return (
      <span className={value === 20232024 ? "fw-bold" : ""}>
        {value.toString().slice(2, 4)}-{value.toString().slice(6, 8)}
      </span>
    );
  }
  if (headerKey === "skaterFullName") {
    return (
      <span className="player-name" onClick={() => handlePlayerClick(player)}>
        {value}
      </span>
    );
  }
  if (headerKey === "compare") {
    const checked = compareList.includes(player.playerId + player.seasonId);

    return (
      <Form.Check
        type="checkbox"
        checked={checked}
        onChange={() => {
          setCompareList((prevList) => {
            if (checked) {
              return prevList.filter(
                (id) => id !== player.playerId + player.seasonId
              );
            } else {
              return [...prevList, player.playerId + player.seasonId];
            }
          });
        }}
      />
    );
  }
  if (value === null || value === "NaN") {
    return "";
  }
  if (typeof value === "number" && !Number.isInteger(value)) {
    return parseFloat(value.toFixed(headerKey === "savePct" ? 3 : 2));
  }
  return value;
};
