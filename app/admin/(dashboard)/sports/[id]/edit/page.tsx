"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Sport {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  pricePerHour: number | string;
  maxPlayers: number | string;
  imageUrl?: string | null;
  isActive: boolean;
}

export default function EditSportPage() {
  const params = useParams();
  const router = useRouter();

  const sportId = params.id as string;

  const [sport, setSport] = useState<Sport | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // Load Sport
  // ==========================================

  useEffect(() => {
    async function fetchSport() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/sports/${sportId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.sport) {
          throw new Error(
            data.message || "Failed to load sport."
          );
        }

        const loadedSport: Sport = data.sport;

        setSport(loadedSport);

        // Populate form
        setName(loadedSport.name);
        setSlug(loadedSport.slug);
        setDescription(
          loadedSport.description ?? ""
        );
        setPricePerHour(
          String(loadedSport.pricePerHour ?? "")
        );
        setMaxPlayers(
          String(loadedSport.maxPlayers ?? "")
        );
        setImageUrl(
          loadedSport.imageUrl ?? ""
        );
        setIsActive(loadedSport.isActive);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load sport."
        );
      } finally {
        setLoading(false);
      }
    }

    if (sportId) {
      fetchSport();
    }
  }, [sportId]);

  // ==========================================
  // Update Sport
  // ==========================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/sports/${sportId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
            description,
            pricePerHour: Number(pricePerHour),
            maxPlayers: Number(maxPlayers),
            imageUrl,
            isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update sport."
        );
      }

      setSuccess("Sport updated successfully.");

      setSport(data.sport);

      // Give the user a moment to see success message
      setTimeout(() => {
        router.push("/admin/sports");
      }, 800);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update sport."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // Loading State
  // ==========================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Edit Sport
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Loading sport details...
          </p>
        </div>

        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Error State
  // ==========================================

  if (error && !sport) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Edit Sport
          </h1>
        </div>

        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-red-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/sports")
            }
            className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Sports
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // Edit Form
  // ==========================================

  return (
    <div className="space-y-6">
      {/* Page Header */}

      <div>
        <button
          type="button"
          onClick={() =>
            router.push("/admin/sports")
          }
          className="mb-4 text-sm text-gray-500 hover:text-black"
        >
          ← Back to Sports
        </button>

        <h1 className="text-3xl font-bold">
          Edit Sport
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the details of this sport.
        </p>
      </div>

      {/* Error Message */}

      {error && (
        <div className="max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Success Message */}

      {success && (
        <div className="max-w-2xl rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-600">
            {success}
          </p>
        </div>
      )}

      {/* Edit Form */}

      <div className="max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Sport Name */}

          <div>
            <label
              htmlFor="sport-name"
              className="mb-2 block text-sm font-medium"
            >
              Sport Name
            </label>

            <input
              id="sport-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              disabled={saving}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
            />
          </div>

          {/* Slug */}

          <div>
            <label
              htmlFor="sport-slug"
              className="mb-2 block text-sm font-medium"
            >
              Slug
            </label>

            <input
              id="sport-slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(event.target.value)
              }
              required
              disabled={saving}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              Use lowercase letters, numbers and
              hyphens.
            </p>
          </div>

          {/* Description */}

          <div>
            <label
              htmlFor="sport-description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="sport-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={4}
              disabled={saving}
              className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
            />
          </div>

          {/* Price */}

          <div>
            <label
              htmlFor="sport-price"
              className="mb-2 block text-sm font-medium"
            >
              Price Per Hour
            </label>

            <input
              id="sport-price"
              type="number"
              min="0"
              step="0.01"
              value={pricePerHour}
              onChange={(event) =>
                setPricePerHour(event.target.value)
              }
              required
              disabled={saving}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
            />
          </div>

          {/* Max Players */}

          <div>
            <label
              htmlFor="sport-max-players"
              className="mb-2 block text-sm font-medium"
            >
              Maximum Players
            </label>

            <input
              id="sport-max-players"
              type="number"
              min="1"
              step="1"
              value={maxPlayers}
              onChange={(event) =>
                setMaxPlayers(event.target.value)
              }
              required
              disabled={saving}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
            />
          </div>

          {/* Image URL */}

          <div>
            <label
              htmlFor="sport-image"
              className="mb-2 block text-sm font-medium"
            >
              Image URL
            </label>

            <input
              id="sport-image"
              type="text"
              value={imageUrl}
              onChange={(event) =>
                setImageUrl(event.target.value)
              }
              placeholder="https://example.com/image.jpg"
              disabled={saving}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
            />
          </div>

          {/* Active */}

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(event.target.checked)
              }
              disabled={saving}
              className="h-4 w-4"
            />

            <span className="text-sm font-medium">
              Active
            </span>
          </label>

          {/* Actions */}

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/sports")
              }
              disabled={saving}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}