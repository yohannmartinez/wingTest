import React from 'react'
import itemsData from '../data/items.json'
import ordersData from '../data/orders.json'
import logo from '../img/wingLogo.svg'



class accueil extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemsList: null,
            ordersList: null,
            parcels: [],
            totalPrice: 0,
            totalWeight: 0,

            weight: 0,
            items: [],
            paletteNumber: 0,
            trackingId: null,

            pagesLength: 0,
            actualPage: 1,
            index: 0,
            shownParcels: null,
            selectedParcel: null,

            /* prices by weight */
            weightPrices: [{ minWeight: 0, maxWeight: 1, price: 1 }, { minWeight: 1, maxWeight: 5, price: 2 }, { minWeight: 5, maxWeight: 10, price: 3 }, { minWeight: 10, maxWeight: 20, price: 5 }, { minWeight: 20, maxWeight: 30, price: 10 }]
        }
        this.generate = this.generate.bind(this);
        this.getItemName = this.getItemName.bind(this);
        this.getItemWeight = this.getItemWeight.bind(this);
        this.generateParcel = this.generateParcel.bind(this);
        this.getPriceByWeight = this.getPriceByWeight.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }


    async componentDidMount() {
        this.setState({ itemsList: itemsData.items, ordersList: ordersData.orders }, () => { this.generate() });
    }

    /* function to start generating */
    generate() {
        console.log("c'est bon")
        this.getPriceByWeight();
        this.state.ordersList.map((order, index) => {
            order.items.map((item) => {
                let i = 0;

                /* functions to get the name and the weight of the item with the item_id */
                let itemWeight = this.getItemWeight(item.item_id)
                let itemName = this.getItemName(item.item_id)


                /* loop on the items while i is inferior than the item quantity */
                while (i < item.quantity) {

                    /* if the weight state exceed 30, the function generate a parcel and put the states "weight" and "items" empty */
                    /* else, she add the weight of the item to the weight state and push him in the items state */
                    if ((this.state.weight + Number(itemWeight)) > 30) {
                        this.getPriceByWeight(this.state.weight)
                        this.generateParcel(order.id, this.state.items, this.state.weight, this.state.paletteNumber)
                        this.state.items = [];
                        this.state.weight = 0;
                        i - 1;
                    } else {
                        this.state.weight = this.state.weight + Number(itemWeight);
                        this.state.items.push({ item: item.item_id, name: itemName, quantity: 1 })
                        i++;
                    }
                }
            })
            /* when the map change of order, put the weight state to 0 */
            this.state.weight = 0;
        });
    }

    /*  check in the items list the good item and return his name and his name */
    getItemName(object) {
        let goodItem = undefined;

        this.state.itemsList.map((item, index) => {
            if (object === item.id) {
                goodItem = item.name;
            }
        })

        return goodItem;
    }

    /*  check in the items list the good item and return his name and his weight */
    getItemWeight(object) {
        let goodItem = undefined;

        this.state.itemsList.map((item, index) => {
            if (object === item.id) {
                goodItem = item.weight;
            }
        })

        return goodItem;
    }

    /* generate a parcel with the informations of the order */
    generateParcel(id, items, weight, paletteNumber) {
        fetch("https://helloacm.com/api/random/?n=15").then(res => res.json()).then(json => { /* fetch to generate the tracking Id */


            this.state.paletteNumber = Math.floor(((this.state.parcels.length) / 15) + 1); /* add one to the palette number by counting the rest of the division of the parcels by 15 */
            this.state.parcels.push({ order_id: id, items: items, weight: weight, tracking_id: json, paletteNumber: this.state.paletteNumber });
            this.setState({ pagesLength: Math.floor(this.state.parcels.length / 5) })
            this.forceUpdate() /* force update to re-render */
        })
    }

    getPriceByWeight(weight) {

        this.state.weightPrices.map((price) => {
            if (weight >= price.minWeight && weight <= price.maxWeight) {
                this.state.totalPrice += price.price;
                this.state.totalWeight += weight;
            }
        })

    }

    previousPage() {
        this.setState({ index: this.state.index -= 5, actualPage: this.state.actualPage -= 1 }, () => {
            this.state.shownParcels = this.state.parcels.slice(this.state.index, (this.state.index + 5));
            this.forceUpdate()
        })
    }

    nextPage() {
        this.setState({ index: this.state.index += 5, actualPage: this.state.actualPage += 1 }, () => {
            this.state.shownParcels = this.state.parcels.slice(this.state.index, (this.state.index + 5));
            this.forceUpdate()
        })
    }

    render() {
        return (
            <div>
                <div className="navbar">
                    <img src={logo} className="navbar_logo" />
                    <div className="container_content_navbar_right">
                        <button className="navbar_connexion_button" onClick={() => { alert('connexion en cours') }}>LOGIN</button>
                    </div>
                </div>

                {/* container of the four blocks where you can get the most important informations */}
                <div className="container_principal_informations">
                    <div className="container_information">
                        <img src={"src/img/parcel.png"} />
                        <div className="container_right_information">
                            <span className="number_infomation">{this.state.parcels.length}</span>
                            <span>Parcels</span>
                        </div>
                    </div>
                    <div className="container_information">
                        <img src={"src/img/weight.png"} />
                        <div className="container_right_information">
                            <span className="number_infomation">{Math.round(this.state.totalWeight)}</span>
                            <span>Total weight</span>
                        </div>
                    </div>
                    <div className="container_information">
                        <img src={"src/img/orders.png"} />
                        <div className="container_right_information">
                            <span className="number_infomation">{this.state.ordersList && <span>{this.state.ordersList.length}</span>}</span>
                            <span>Total orders</span>
                        </div>
                    </div>
                    <div className="container_information">
                        <img src={"src/img/euroIcon.png"} />
                        <div className="container_right_information">
                            <span className="number_infomation">{this.state.totalPrice && <span>{this.state.totalPrice} €</span>}</span>
                            <span>Sales performance</span>
                        </div>
                    </div>
                </div>


                <div className="container_flex">
                    {/* container with the parcels */}
                    <div className="container_parcels">
                        <p className="tite_container">PARCELS PAGE {this.state.actualPage} OF {this.state.pagesLength}</p>

                        <div className="container_button_change_page">
                            {this.state.actualPage !== 1 &&
                                <div className="button_change_page" onClick={() => { this.previousPage() }}>PREVIOUS</div>
                            }
                            {this.state.actualPage !== this.state.pagesLength &&
                                <div className="button_change_page" onClick={() => { this.nextPage() }}>NEXT</div>
                            }
                        </div>


                        {this.state.parcels.length > 5 && this.state.shownParcels === null &&
                            <div className="container_global_parcels">
                                {this.state.parcels.slice(this.state.index, (this.state.index + 5)).map((parcel, index) =>
                                    <div className="parcel_container" onClick={() => { this.state.selectedParcel = this.state.parcels[index];this.forceUpdate() }} >
                                        <span className="parcel_info">Order ID : {parcel.order_id}</span>
                                        <span className="parcel_info">Total weight : {parcel.weight}</span>
                                    </div>
                                )}
                            </div>
                        }

                        {this.state.parcels.length > 5 && this.state.shownParcels !== null &&
                            <div className="container_global_parcels">
                                {this.state.shownParcels.map((parcel, index) =>
                                    <div className="parcel_container" onClick={() => { this.state.selectedParcel = this.state.shownParcels[index];this.forceUpdate() }}>
                                        <span className="parcel_info">Order ID : {parcel.order_id}</span>
                                        <span className="parcel_info">Total weight : {parcel.weight}</span>
                                    </div>
                                )}
                            </div>
                        }
                    </div>

                    {/* container with the selected parcel */}
                    <div className="container_selected_parcel">
                        <p className="tite_container">SELECTED PARCEL</p>

                        {this.state.selectedParcel === null &&
                            <span className="parcel_no_selected_text">Select a parcel to see the details</span>
                        }

                        {this.state.selectedParcel !== null &&
                            <div className="container_details">
                                <p className="parcel_details">Order ID : {this.state.selectedParcel.order_id}</p>
                                <p className="parcel_details">Items number : {this.state.selectedParcel.items.length}</p>
                                <p className="parcel_details">Tracking ID : {this.state.selectedParcel.tracking_id}</p>
                                <p className="parcel_details">Weight : {this.state.selectedParcel.weight}</p>
                                <p className="parcel_details">Palette Number : {this.state.selectedParcel.paletteNumber}</p>
                            </div>
                        }
                    </div>
                </div>

            </div>
        )
    }
}

export default accueil;
