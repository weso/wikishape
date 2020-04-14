import React from "react";

import {render, fireEvent} from "@testing-library/react";
import WikidataValidateSPARQL from "../../WikidataValidateSPARQL";
import '@testing-library/jest-dom/extend-expect'
import {waitForElement} from "@testing-library/dom";
import {addCreateTextRangePolyfill} from "../../utils/TestPolyfill";
import axios from "axios";

function before() {
    addCreateTextRangePolyfill();
    return {search: ""};
}

test("WikidataValidateSPARQL - shows data", async () => {

    const location = before();
    const {queryByText, queryAllByRole, findAllByText} = render(<WikidataValidateSPARQL location={location}/>);
    // Page title
    const title = await waitForElement(() => queryByText(
        /Validate Wikidata entities obtained from SPARQL queries/i));
    expect(title).toBeInTheDocument();

    // 2 visible input tabs
    let tabs = await waitForElement(() => queryAllByRole("tab"));
    expect(tabs.length).toEqual(2);

    // 2 visible input status
    let status = await waitForElement(() => queryAllByRole("status"));
    expect(status.length).toEqual(2);

    // change input type
    let shexTab = queryAllByRole("tab")[1];
    fireEvent.click(shexTab);

    // 5 visible input tabs
    tabs = await waitForElement(() => queryAllByRole("tab"));
    expect(tabs.length).toEqual(5);

    // no visible input status
    status = await waitForElement(() => queryAllByRole("status"));
    expect(status.length).toEqual(0);

    // Data input selector
    const dataInput = await waitForElement(() => queryByText(/^ShEx input$/i));
    expect(dataInput).toBeInTheDocument();
    // ShEx format selector
    const shexFormat = await waitForElement(() => queryByText(/^ShEx format$/i));
    expect(shexFormat).toBeInTheDocument();
});

test("WikidataValidateSPARQL - submit data and show results after data submit", async () => {

    const location = before();
    const {queryByText, queryAllByRole} = render(<WikidataValidateSPARQL location={location}/>);

    // change input type
    const shexTab = queryAllByRole("tab")[1];
    fireEvent.click(shexTab);

    // submit form
    const submitBtn = queryByText(/^Validate wikidata entities$/i);
    fireEvent.click(submitBtn);
    expect(axios.post).toHaveBeenCalledTimes(1);

    // expect an alert with the validation status
    let alerts = await waitForElement(() => queryAllByRole("alert"));
    expect(alerts.length).toEqual(1);
});
