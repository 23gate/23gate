import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);

export default dayjs;

export { dayjs };

export function formatISOToFullDate(datetime) {
  return dayjs.utc(datetime).format('YYYY-MM-DD HH:mm:ss');
}

export function formatISOToDate(datetime) {
  return dayjs.utc(datetime).format('YYYY-MM-DD');
}

export function formatISOToTime(datetime) {
  return dayjs.utc(datetime).format('HH:mm:ss');
}

export function unixtime() {
  return Math.floor(Date.now() / 1000);
}
