// Monthly, fixed-rate amortization illustration, with no fees or extra borrowing.
// Amounts are integer yen. Interest is rounded down each month. The regular
// payment is rounded up; the last payment settles the remaining balance.
export function calculateLoan(principal, annualRate, months) {
  if(!Number.isInteger(principal)||principal<1000||principal>5000000||!Number.isFinite(annualRate)||annualRate<0||annualRate>20||!Number.isInteger(months)||months<1||months>120) throw new RangeError('入力範囲を確認してください。');
  const rate=annualRate/100/12;
  const payment=Math.ceil(rate===0?principal/months:principal*rate/(-Math.expm1(-months*Math.log1p(rate))));
  const schedule=[];
  let balance=principal,total=0,totalInterest=0;
  for(let i=1;i<=months&&balance>0;i++){
    const interest=Math.floor(balance*rate+1e-8);
    const paid=i===months?balance+interest:Math.min(payment,balance+interest);
    balance-=paid-interest;
    total+=paid;totalInterest+=interest;
    schedule.push({month:i,payment:paid,interest,balance});
  }
  return {payment,total,interest:totalInterest,principal,months,schedule};
}
