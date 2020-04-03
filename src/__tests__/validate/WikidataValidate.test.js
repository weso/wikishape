import React from "react";

import {render, fireEvent} from "@testing-library/react";
import WikidataValidate from "../../WikidataValidate";
import '@testing-library/jest-dom/extend-expect'
import {waitForElement} from "@testing-library/dom";
import {addCreateTextRangePolyfill} from "../../utils/TestPolyfill";
import axios from "axios";

function before() {
    addCreateTextRangePolyfill();
    return {search: ""};
}

test("WikidataValidate - shows data", async () => {

    const location = before();
    const {queryByText, queryAllByRole, findAllByText} = render(<WikidataValidate location={location}/>);
    // Page title
    const title = await waitForElement(() => findAllByText(/Validate Wikidata entities/i));
    title.forEach( t => expect(t).toBeInTheDocument());

    // 2 visible input tabs
    const tabs = await waitForElement(() => queryAllByRole("tab"));
    expect(tabs.length).toEqual(2);

    // 4 input status
    const status = await waitForElement(() => queryAllByRole("status"));
    expect(status.length).toEqual(4);

    // Data input selector
    const dataInput = await waitForElement(() => queryByText(/^ShEx input$/i));
    expect(dataInput).toBeInTheDocument();
    // ShEx format selector
    const shexFormat = await waitForElement(() => queryByText(/^ShEx format$/i));
    expect(shexFormat).toBeInTheDocument();
});

test("WikidataValidate - submit data and show results after data submit", async () => {

    const location = before();
    const {queryByText, queryAllByRole} = render(<WikidataValidate location={location}/>);

    // change input type
    let shexTab = queryAllByRole("tab")[1];
    fireEvent.click(shexTab);

    // submit form
    fireEvent.click(queryByText(/^Validate wikidata entities$/));
    // expect(axios.post).toHaveBeenCalledTimes(0);

    // expect an alert with the validation status
    let alerts = queryAllByRole("alert");
    expect(alerts.length).toEqual(1);

    // Expect permalink
    expect(queryByText(/permalink/i)).toBeInTheDocument();
});
