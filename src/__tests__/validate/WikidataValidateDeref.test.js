import React from "react";

import {render, fireEvent} from "@testing-library/react";
import WikidataValidateDeref from "../../wikidata/WikidataValidateDeref";
import '@testing-library/jest-dom/extend-expect'
import {waitForElement} from "@testing-library/dom";
import {addCreateTextRangePolyfill} from "../../utils/TestPolyfill";
import axios from "axios";

function before() {
    addCreateTextRangePolyfill();
    return {search: ""};
}

test("WikidataValidateDeref - shows data", async () => {

    const location = before();
    const {queryByText, queryAllByRole} = render(<WikidataValidateDeref location={location}/>);

    // 2 visible input tabs
    let tabs = await waitForElement(() => queryAllByRole("tab"));
    expect(tabs.length).toEqual(2);

    // 4 visible input status
    let status = await waitForElement(() => queryAllByRole("status"));
    expect(status.length).toEqual(4);

    // change input type
    let shexTab = queryAllByRole("tab")[1];
    fireEvent.click(shexTab);

    // 5 visible input tabs
    tabs = await waitForElement(() => queryAllByRole("tab"));
    expect(tabs.length).toEqual(5);

    // 2 visible input status
    status = await waitForElement(() => queryAllByRole("status"));
    expect(status.length).toEqual(2);

    // Data input selector
    const dataInput = await waitForElement(() => queryByText(/^ShEx input$/i));
    expect(dataInput).toBeInTheDocument();
    // ShEx format selector
    const shexFormat = await waitForElement(() => queryByText(/^ShEx format$/i));
    expect(shexFormat).toBeInTheDocument();
});

test("WikidataValidateDeref - submit data and show results after data submit", async () => {

    const location = before();
    const {queryByText, queryAllByText, queryAllByRole} = render(<WikidataValidateDeref location={location}/>);

    // change input type
    const shexTab = queryAllByRole("tab")[1];
    fireEvent.click(shexTab);

    // submit form
    const submitBtn = queryByText(/^Validate wikidata entities$/i);
    fireEvent.click(submitBtn);
    expect(axios.post).toHaveBeenCalledTimes(0); // uses get request

    // expect an alert with the validation status
    const alerts = await waitForElement(() => queryAllByRole("alert"));
    expect(alerts.length).toEqual(1);

    // expect 0 errors within the validation status
    const errors = await waitForElement(() => queryAllByText(/^Error$/i));
    expect(errors.length).toEqual(0);
});
