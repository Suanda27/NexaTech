import os
import random
import time
from typing import Any

from locust import HttpUser, between, events, task


CUSTOMER_EMAIL = os.getenv("LOCUST_CUSTOMER_EMAIL")
CUSTOMER_PASSWORD = os.getenv("LOCUST_CUSTOMER_PASSWORD")
ADMIN_EMAIL = os.getenv("LOCUST_ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("LOCUST_ADMIN_PASSWORD")
ENABLE_WRITES = os.getenv("LOCUST_ENABLE_WRITES", "false").lower() in {
    "1",
    "true",
    "yes",
    "on",
}
ENABLE_CHECKOUT = os.getenv("LOCUST_ENABLE_CHECKOUT", "false").lower() in {
    "1",
    "true",
    "yes",
    "on",
}


def api_headers(token: str | None = None) -> dict[str, str]:
    headers = {"Accept": "application/json"}

    if token:
        headers["Authorization"] = f"Bearer {token}"

    return headers


def json_headers(token: str | None = None) -> dict[str, str]:
    return {
        **api_headers(token),
        "Content-Type": "application/json",
    }


def response_json(response: Any) -> dict[str, Any]:
    try:
        data = response.json()
    except ValueError:
        return {}

    return data if isinstance(data, dict) else {}


@events.init_command_line_parser.add_listener
def add_profile_argument(parser: Any) -> None:
    parser.add_argument(
        "--profile",
        choices=["public", "customer", "admin", "mixed"],
        default=os.getenv("LOCUST_PROFILE", "mixed"),
        help="Pilih kelompok skenario yang dijalankan.",
    )


class NexaTechUser(HttpUser):
    abstract = True
    wait_time = between(1, 4)
    token: str | None = None
    product_ids: list[int]
    category_slugs: list[str]

    def on_start(self) -> None:
        self.product_ids = []
        self.category_slugs = []
        self.load_catalog_cache()

    @property
    def profile(self) -> str:
        return self.environment.parsed_options.profile

    def profile_enabled(self, *profiles: str) -> bool:
        return self.profile in profiles or self.profile == "mixed"

    def load_catalog_cache(self) -> None:
        with self.client.get(
            "/api/categories",
            headers=api_headers(),
            name="GET /api/categories",
            catch_response=True,
        ) as response:
            if response.ok:
                categories = response_json(response).get("data", [])
                self.category_slugs = [
                    item["slug"]
                    for item in categories
                    if isinstance(item, dict) and isinstance(item.get("slug"), str)
                ]

        with self.client.get(
            "/api/products?per_page=8",
            headers=api_headers(),
            name="GET /api/products",
            catch_response=True,
        ) as response:
            if response.ok:
                products = response_json(response).get("data", [])
                self.product_ids = [
                    item["id"]
                    for item in products
                    if isinstance(item, dict) and isinstance(item.get("id"), int)
                ]

    def login(self, path: str, email: str | None, password: str | None) -> str | None:
        if not email or not password:
            return None

        with self.client.post(
            path,
            json={"email": email, "password": password},
            headers=json_headers(),
            name=f"POST {path}",
            catch_response=True,
        ) as response:
            if not response.ok:
                response.failure(
                    "Login gagal. Periksa credential environment Locust."
                )
                return None

            token = response_json(response).get("token")

            if not isinstance(token, str) or not token:
                response.failure("Response login tidak berisi token.")
                return None

            return token


class PublicCatalogUser(NexaTechUser):
    weight = 5

    @task(4)
    def browse_public_catalog(self) -> None:
        if not self.profile_enabled("public"):
            return

        self.client.get(
            "/api/categories",
            headers=api_headers(),
            name="GET /api/categories",
        )
        self.client.get(
            "/api/products/featured",
            headers=api_headers(),
            name="GET /api/products/featured",
        )
        self.client.get(
            "/api/products/recommendations",
            headers=api_headers(),
            name="GET /api/products/recommendations",
        )

    @task(3)
    def search_and_filter_products(self) -> None:
        if not self.profile_enabled("public"):
            return

        query = random.choice(["laptop", "monitor", "keyboard", "mouse", "ssd"])
        sort = random.choice(["newest", "best_selling", "a_z"])
        path = f"/api/products?q={query}&sort={sort}&per_page=8"

        if self.category_slugs and random.random() < 0.5:
            path += f"&category={random.choice(self.category_slugs)}"

        self.client.get(
            path,
            headers=api_headers(),
            name="GET /api/products?filters",
        )

    @task(2)
    def view_product_detail(self) -> None:
        if not self.profile_enabled("public") or not self.product_ids:
            return

        product_id = random.choice(self.product_ids)
        self.client.get(
            f"/api/products/{product_id}",
            headers=api_headers(),
            name="GET /api/products/{id}",
        )


class CustomerJourneyUser(NexaTechUser):
    weight = 3

    def on_start(self) -> None:
        super().on_start()
        self.token = self.login(
            "/api/auth/login",
            CUSTOMER_EMAIL,
            CUSTOMER_PASSWORD,
        )

    def customer_ready(self) -> bool:
        return self.profile_enabled("customer") and self.token is not None

    @task(3)
    def browse_customer_area(self) -> None:
        if not self.customer_ready():
            return

        self.client.get(
            "/api/auth/me",
            headers=api_headers(self.token),
            name="GET /api/auth/me",
        )
        self.client.get(
            "/api/profile",
            headers=api_headers(self.token),
            name="GET /api/profile",
        )
        self.client.get(
            "/api/orders",
            headers=api_headers(self.token),
            name="GET /api/orders",
        )

    @task(3)
    def inspect_cart_and_recommendations(self) -> None:
        if not self.customer_ready():
            return

        self.client.get(
            "/api/cart/count",
            headers=api_headers(self.token),
            name="GET /api/cart/count",
        )
        self.client.get(
            "/api/cart",
            headers=api_headers(self.token),
            name="GET /api/cart",
        )
        self.client.get(
            "/api/recommendations",
            headers=api_headers(self.token),
            name="GET /api/recommendations",
        )

    @task(1)
    def write_customer_activity(self) -> None:
        if not self.customer_ready() or not ENABLE_WRITES:
            return

        if not self.product_ids:
            self.load_catalog_cache()

        if not self.product_ids:
            return

        product_id = random.choice(self.product_ids)
        quantity = random.randint(1, 2)

        self.client.post(
            "/api/product-searches",
            json={"keyword": random.choice(["laptop", "monitor", "mouse"])},
            headers=json_headers(self.token),
            name="POST /api/product-searches",
        )
        self.client.post(
            "/api/cart/items",
            json={"product_id": product_id, "quantity": quantity},
            headers=json_headers(self.token),
            name="POST /api/cart/items",
        )
        self.client.patch(
            f"/api/cart/items/{product_id}",
            json={"quantity": quantity + 1},
            headers=json_headers(self.token),
            name="PATCH /api/cart/items/{id}",
        )

        if ENABLE_CHECKOUT:
            self.client.post(
                "/api/orders",
                json={
                    "first_name": "Load",
                    "last_name": "Test",
                    "address": "Batam Center",
                    "city": "Batam",
                    "postal_code": "29433",
                    "payment_method": "cod",
                },
                headers=json_headers(self.token),
                name="POST /api/orders",
            )
        else:
            self.client.delete(
                f"/api/cart/items/{product_id}",
                headers=api_headers(self.token),
                name="DELETE /api/cart/items/{id}",
            )

    def on_stop(self) -> None:
        if self.token:
            self.client.post(
                "/api/auth/logout",
                headers=api_headers(self.token),
                name="POST /api/auth/logout",
            )


class AdminReadUser(NexaTechUser):
    weight = 1

    def on_start(self) -> None:
        super().on_start()
        self.token = self.login(
            "/api/auth/admin/login",
            ADMIN_EMAIL,
            ADMIN_PASSWORD,
        )

    def admin_ready(self) -> bool:
        return self.profile_enabled("admin") and self.token is not None

    @task(3)
    def view_admin_dashboard(self) -> None:
        if not self.admin_ready():
            return

        self.client.get(
            "/api/admin/me",
            headers=api_headers(self.token),
            name="GET /api/admin/me",
        )
        self.client.get(
            "/api/admin/dashboard",
            headers=api_headers(self.token),
            name="GET /api/admin/dashboard",
        )

    @task(2)
    def view_admin_catalog(self) -> None:
        if not self.admin_ready():
            return

        self.client.get(
            "/api/admin/categories",
            headers=api_headers(self.token),
            name="GET /api/admin/categories",
        )
        self.client.get(
            "/api/admin/products?per_page=10",
            headers=api_headers(self.token),
            name="GET /api/admin/products",
        )

    @task(2)
    def view_admin_orders(self) -> None:
        if not self.admin_ready():
            return

        with self.client.get(
            "/api/admin/orders?per_page=10",
            headers=api_headers(self.token),
            name="GET /api/admin/orders",
            catch_response=True,
        ) as response:
            if not response.ok:
                return

            orders = response_json(response).get("data", [])

        if isinstance(orders, list) and orders:
            order = random.choice(orders)
            order_id = order.get("id") if isinstance(order, dict) else None

            if isinstance(order_id, str):
                self.client.get(
                    f"/api/admin/orders/{order_id}",
                    headers=api_headers(self.token),
                    name="GET /api/admin/orders/{id}",
                )

    def on_stop(self) -> None:
        if self.token:
            time.sleep(random.uniform(0.1, 0.5))
            self.client.post(
                "/api/auth/logout",
                headers=api_headers(self.token),
                name="POST /api/auth/logout",
            )
