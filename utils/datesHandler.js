const addDays = (days)  => {
    const newDate = new Date();
    newDate.setDate(new Date().getDate() + days);
    return newDate;
}

export {addDays}
