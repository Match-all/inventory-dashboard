# kpi_calculator.py

def calculate_inventory_turnover(cogs, average_inventory):
    """Calculate Inventory Turnover."""
    return cogs / average_inventory


def calculate_stockout_rate(stockout_occurrences, total_orders):
    """Calculate Stockout Rate."""
    return (stockout_occurrences / total_orders) * 100


def calculate_fill_rate(orders_shipped_complete, total_orders):
    """Calculate Fill Rate."""
    return (orders_shipped_complete / total_orders) * 100


def calculate_dsi(average_inventory, cogs):
    """Calculate Days Sales of Inventory (DSI)."""
    return (average_inventory / cogs) * 365


def calculate_eoq(demand, ordering_cost, holding_cost):
    """Calculate Economic Order Quantity (EOQ)."""
    from math import sqrt
    return sqrt((2 * demand * ordering_cost) / holding_cost)


def calculate_inventory_shrinkage(recorded_inventory, actual_inventory):
    """Calculate Inventory Shrinkage."""
    return ((recorded_inventory - actual_inventory) / recorded_inventory) * 100


def calculate_backorder_rate(backordered_items, total_items_ordered):
    """Calculate Backorder Rate."""
    return (backordered_items / total_items_ordered) * 100

# Example usage
if __name__ == "__main__":
    # Sample data
    cogs = 100000
    average_inventory = 20000
    stockout_occurrences = 10
    total_orders = 100
    orders_shipped_complete = 95
    demand = 5000
    ordering_cost = 50
    holding_cost = 5
    recorded_inventory = 1000
    actual_inventory = 950
    backordered_items = 5
    total_items_ordered = 100

    # Calculations
    print("Inventory Turnover:", calculate_inventory_turnover(cogs, average_inventory))
    print("Stockout Rate:", calculate_stockout_rate(stockout_occurrences, total_orders))
    print("Fill Rate:", calculate_fill_rate(orders_shipped_complete, total_orders))
    print("DSI:", calculate_dsi(average_inventory, cogs))
    print("EOQ:", calculate_eoq(demand, ordering_cost, holding_cost))
    print("Inventory Shrinkage:", calculate_inventory_shrinkage(recorded_inventory, actual_inventory))
    print("Backorder Rate:", calculate_backorder_rate(backordered_items, total_items_ordered))
