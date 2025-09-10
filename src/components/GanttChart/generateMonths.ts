type GenerateMonths = (
  projectStart: dayjs.Dayjs,
  projectEnd: dayjs.Dayjs
) => TimelineMonth[];
import type dayjs from "dayjs";
import type { TimelineMonth } from "../Types";

export const generateMonths: GenerateMonths = (projectStart, projectEnd) => {
  const months: TimelineMonth[] = [];

  // Inizia dal primo giorno del mese in cui cade la data di inizio progetto
  let current = projectStart.startOf("month");

  // Continua finché non si supera la fine del progetto
  while (current.isSameOrBefore(projectEnd, "day")) {
    // Confini reali del mese corrente (dal 1 al 30/31/28)
    const monthStart = current.startOf("month");
    const monthEnd = current.endOf("month");

    // Confini effettivi limitati al progetto
    // - se il progetto parte dopo il 1 → si parte da projectStart
    // - se il progetto finisce prima della fine mese → si ferma a projectEnd
    const effectiveStart = monthStart.isBefore(projectStart) ? projectStart : monthStart;
    const effectiveEnd = monthEnd.isAfter(projectEnd) ? projectEnd : monthEnd;

    // Calcola i giorni realmente compresi nel progetto per quel mese
    const daysInRange = effectiveEnd.diff(effectiveStart, "day") + 1;

    // Salva il mese (con etichetta, date effettive e durata in giorni)
    months.push({
      label: current.format("MMM YYYY").toUpperCase(),
      start: effectiveStart.toDate(),
      end: effectiveEnd.toDate(),
      daysInMonth: daysInRange,
    });

    // Passa al mese successivo (sempre al giorno 1)
    current = current.add(1, "month").startOf("month");
  }

  return months;
};
