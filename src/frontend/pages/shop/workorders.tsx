/**
 * A NextPage used to display work orders for shops on the application.
 * Work in progress as is POST-MVP.
 */

import { Button, Form } from "react-bootstrap";
import { NextPage } from "next";
import { useState, useEffect, FunctionComponent } from "react";
import CustomNavBar from "../../components/navigation/navBar";

import { useAppContext } from "../../context/state";
import {
	AFFLIATED_URL_WITH_ID,
	METHOD_TYPES,
	request,
	WORKORDER_URL,
	WORKORDER_URL_WITH_ID,
} from "../../scripts/request";
import { ShopService, WorkOrder } from "../../components/types";

const WorkOrders: NextPage = () => {
	const ctx = useAppContext();

	const [shopWorkOrders, setShopWorkOrders] = useState<Array<WorkOrder>>([]);

	useEffect(() => {
		const loadWorkOrders = async () => {
			const user_id = ctx.user ? ctx.user.id.toString() : "";
			if (user_id) {
				const shop_result = await request(
					AFFLIATED_URL_WITH_ID(user_id),
					null,
					null
				);
				if (shop_result.success) {
					const shop = shop_result.success.shop;
					const work_orders_results = await request(
						WORKORDER_URL,
						METHOD_TYPES.READ,
						null
					);
					if (work_orders_results.success) {
						const work_orders = work_orders_results.success;
						setShopWorkOrders(
							work_orders.filter(
								(workOrder: any) =>
									workOrder.appointment.quote.shop.id === shop.id
							)
						);
					}
				}
			}
		};
		loadWorkOrders();
	}, [ctx.user]);

	const editWorkOrdersSectionTitle = "My Work Orders";

	const noWorkOrdersText = "No work orders yet!";

	const invalidUserMessage =
		" Sorry, this page is only available for shop owner accounts with a registered shop.";
	const invalidShopMessage =
		"Shop loading... (if this message persists, you may be accessing this page without a registered shop)";

	if (!ctx.user) {
		return (
			<>
				<CustomNavBar />
				<div className="tw-flex tw-flex-col tw-gap-[20px] tw-py-[20px] tw-px-[80px]">
					{invalidUserMessage}
				</div>
			</>
		);
	}

	/*if (!ctx.shop) {
		return (
			<>
				<CustomNavBar />
				<div className="tw-flex tw-flex-col tw-gap-[20px] tw-py-[20px] tw-px-[80px]">
					{invalidShopMessage}
				</div>
			</>
		);
	}*/

	return (
		<>
			<CustomNavBar />
			<div className="tw-flex tw-flex-col tw-gap-[20px] tw-py-[20px] tw-px-[80px]">
				<div className="tw-flex tw-flex-col tw-gap-[20px]">
					{"My Pending Work Orders"}
					<div className="responsive-grid">
						{shopWorkOrders.length ? (
							shopWorkOrders.filter((workOrder: WorkOrder) => workOrder.status === "pending").map((workOrder: WorkOrder) => {
								return (
									<WorkOrderCard
										shopWorkOrder={workOrder}
										shopWorkOrders={shopWorkOrders}
										setShopWorkOrders={setShopWorkOrders}
										key={workOrder.id}
									/>
								);
							})
						) : (
							<div className="tw-text-white">{noWorkOrdersText}</div>
						)}
					</div>
				</div>
				<div className="tw-flex tw-flex-col tw-gap-[20px]">
					{"My Completed Work Orders"}
					<div className="responsive-grid">
						{shopWorkOrders.length ? (
							shopWorkOrders.filter((workOrder: WorkOrder) => workOrder.status === "completed").map((workOrder: WorkOrder) => {
								return (
									<WorkOrderCard
										shopWorkOrder={workOrder}
										shopWorkOrders={shopWorkOrders}
										setShopWorkOrders={setShopWorkOrders}
										key={workOrder.id}
									/>
								);
							})
						) : (
							<div className="tw-text-white">{noWorkOrdersText}</div>
						)}
					</div>
				</div>
				<div className="tw-flex tw-flex-col tw-gap-[20px]">
					{"My Cancelled Work Orders"}
					<div className="responsive-grid">
						{shopWorkOrders.length ? (
							shopWorkOrders.filter((workOrder: WorkOrder) => workOrder.status === "cancelled").map((workOrder: WorkOrder) => {
								return (
									<WorkOrderCard
										shopWorkOrder={workOrder}
										shopWorkOrders={shopWorkOrders}
										setShopWorkOrders={setShopWorkOrders}
										key={workOrder.id}
									/>
								);
							})
						) : (
							<div className="tw-text-white">{noWorkOrdersText}</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

interface WorkOrderCardProps {
	shopWorkOrder: WorkOrder;
	shopWorkOrders: Array<WorkOrder>;
	setShopWorkOrders: Function;
}

const WorkOrderCard: FunctionComponent<WorkOrderCardProps> = (
	props: WorkOrderCardProps
) => {
	const workOrder = props.shopWorkOrder;
	const workOrders = props.shopWorkOrders;
	const setWorkOrders = props.setShopWorkOrders;

	const [isEditing, setIsEditing] = useState<boolean>(false);

	const [workOrderStatus, setWorkOrderStatus] = useState<string>(
		workOrder.status
	);
	const [workOrderDescription, setWorkOrderDescription] = useState<string>(
		workOrder.work_description
	);
	const [workOrderNote, setWorkOrderNote] = useState<string>(workOrder.note);

	const appointmentTitle = workOrder.appointment.title;
	const appointmentDescription = workOrder.appointment.description;
	const agreedPrice = workOrder.appointment.price_estimate;
	const reservationTime = workOrder.appointment.reservation.time;
	const customerName = `${workOrder.appointment.customer.first_name} ${workOrder.appointment.customer.last_name}`;
	const customerContact = `${workOrder.appointment.customer.email} ${workOrder.appointment.customer.phone}`;
	const customerVehicle = `${workOrder.appointment.quote.quote_request.make} ${workOrder.appointment.quote.quote_request.model} ${workOrder.appointment.quote.quote_request.year}`;
	const customerPartPreference =
		workOrder.appointment.quote.quote_request.part_preference;
	const agreedServices = workOrder.appointment.quote.services
		.map((service: ShopService) => service.name)
		.join(", ");

	const cancelButtonText = "Cancel";
	const submitButtonText = "Save";

	return (
		<div className="tw-flex tw-flex-col tw-gap-[12px] tw-p-[16px] tw-bg-white tw-rounded tw-shadow-lg">
			<div className="tw-flex tw-flex-row tw-justify-between tw-gap-[10px]">
				<div className="tw-break-all">{`Work Order #${workOrder.id}`}</div>
				<div className="tw-flex tw-flex-row tw-gap-[6px]">
					{!isEditing ? (
						<>
							<Button
								className="tw-h-[48px]"
								variant="danger"
								onClick={async () => {
									await request(
										WORKORDER_URL_WITH_ID(workOrder.id.toString()),
										METHOD_TYPES.DELETE,
										null
									);
									setWorkOrders(
										workOrders.filter((wo) => wo.id !== workOrder.id)
									);
								}}
							>
								<i className="fa-solid fa-trash" />
							</Button>
							<Button
								className="tw-h-[48px]"
								variant="primary"
								onClick={() => {
									setIsEditing(true);
								}}
							>
								<i className="fa-solid fa-pen" />
							</Button>
						</>
					) : null}
				</div>
			</div>
			<div className="tw-flex tw-flex-col tw-gap-[6px]">
				{isEditing ? (
					<>
						<Form.Group>
							<Form.Label className="tw-font-semibold">
								{"Work Order Status"}
							</Form.Label>
							<Form.Check
								inline
								label="Pending"
								type="radio"
								id="inline-radio-1"
								checked={workOrderStatus === "pending"}
								onChange={(event) => {
									setWorkOrderStatus("pending");
								}}
							/>
							<Form.Check
								inline
								label="Complete"
								type="radio"
								id="inline-radio-2"
								checked={workOrderStatus === "complete"}
								onChange={(event) => {
									setWorkOrderStatus("complete");
								}}
							/>
							<Form.Check
								inline
								disabled
								label="Cancelled"
								type="radio"
								id="inline-radio-3"
								checked={workOrderStatus === "cancelled"}
								onChange={(event) => {
									setWorkOrderStatus("cancelled");
								}}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label className="tw-font-semibold">
								{"Work Order Description"}
							</Form.Label>
							<Form.Control
								as="textarea"
								type="text"
								placeholder={"A description of the work order"}
								value={workOrderDescription}
								onChange={(event) => {
									setWorkOrderDescription(event.target.value);
								}}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label className="tw-font-semibold">
								{"Work Order Note"}
							</Form.Label>
							<Form.Control
								as="textarea"
								type="text"
								placeholder={"Any important notes to keep mind of"}
								value={workOrderNote}
								onChange={(event) => {
									setWorkOrderNote(event.target.value);
								}}
							/>
						</Form.Group>
					</>
				) : (
					<>
						<div>{`Work Order Status: ${workOrderStatus}`}</div>
						<div>{`Work Order Description: ${workOrderDescription || "Unset"
							}`}</div>
						<div>{`Work Order Note: ${workOrderNote || "Unset"}`}</div>
					</>
				)}
				<div>{`Appointment Title: ${appointmentTitle || "Unset"}`}</div>
				<div>{`Appointment Description: ${appointmentDescription || "Unset"
					}`}</div>
				<div>{`Reservaation Time: ${reservationTime || "Unset"}`}</div>
				<div>{`Agreed Price: ${agreedPrice || "Unset"}`}</div>
				<div>{`Agreed Services: ${agreedServices || "Unset"}`}</div>
				<div>{`Customer Name: ${customerName || "Unset"}`}</div>
				<div>{`Customer Contact: ${customerContact || "Unset"}`}</div>
				<div>{`Customer Vehicle: ${customerContact || "Unset"}`}</div>
				<div>{`Customer Part Preference: ${customerPartPreference || "Unset"
					}`}</div>
			</div>
			{isEditing ? (
				<div className="tw-flex tw-flex-row tw-justify-end tw-gap-[6px]">
					<Button
						variant="secondary"
						onClick={() => {
							setWorkOrderStatus(workOrder.status);
							setWorkOrderDescription(workOrder.work_description);
							setWorkOrderNote(workOrder.note);
							setIsEditing(false);
						}}
					>
						{cancelButtonText}
					</Button>
					<Button
						variant="primary"
						onClick={async () => {
							const workOrderIndex = workOrders.findIndex(
								(wo) => wo.id === workOrder.id
							);
							workOrders[workOrderIndex].status = workOrderStatus;
							workOrders[workOrderIndex].work_description =
								workOrderDescription;
							workOrders[workOrderIndex].note = workOrderNote;
							await request(
								WORKORDER_URL_WITH_ID(workOrder.id.toString()),
								METHOD_TYPES.UPDATE,
								workOrders[workOrderIndex]
							);
							setWorkOrders(workOrders);
						}}
					>
						{submitButtonText}
					</Button>
				</div>
			) : null}
		</div>
	);
};

export default WorkOrders;
