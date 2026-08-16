"use client";

import { useState } from "react";

interface AddSportFormProps {
  onClose: () => void;
   onSuccess: () => void;
}

export default function AddSportForm({
  onClose,
   onSuccess,
}: AddSportFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Generate slug automatically from sport name
  function handleNameChange(value: string) {
    setName(value);

    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    );
  }

  // Submit form
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/sports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          pricePerHour: Number(pricePerHour),
          maxPlayers: Number(maxPlayers),
          imageUrl: imageUrl || undefined,
          isActive,
        }),
      });

      // Read response as text first.
      // This prevents JSON parsing errors if the server
      // returns an empty response.
      const responseText = await response.text();

      let data: {
        success?: boolean;
        message?: string;
        errors?: Record<string, string[]>;
      } = {};

      // Parse JSON only when response contains something
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Invalid JSON response from API:",
            parseError
          );

          console.error(
            "Raw API response:",
            responseText
          );

          throw new Error(
            `Server returned an invalid response (${response.status}).`
          );
        }
      }

      // Handle API errors
      // Handle API errors
if (!response.ok || !data.success) {
  console.error("Create sport API error:", {
    status: response.status,
    response: data,
    rawResponse: responseText,
  });

  throw new Error(
    data.message ||
      `Failed to create sport. Server returned ${response.status}.`
  );
}

// Sport created successfully
onSuccess();
onClose();

    } catch (error) {
      console.error("Create sport error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Add Sport
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add a new sport to your facility.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-2xl leading-none text-gray-400 hover:text-black disabled:cursor-not-allowed"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
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
                handleNameChange(event.target.value)
              }
              placeholder="e.g. Football"
              required
              disabled={isSubmitting}
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
              placeholder="football"
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              Used for URLs and internal identification.
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
              placeholder="Describe this sport..."
              rows={3}
              disabled={isSubmitting}
              className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
            />
          </div>

          {/* Price + Maximum Players */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price Per Hour */}
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
                min="1"
                step="1"
                value={pricePerHour}
                onChange={(event) =>
                  setPricePerHour(event.target.value)
                }
                placeholder="e.g. 1200"
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
              />
            </div>

            {/* Maximum Players */}
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
                placeholder="e.g. 12"
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
              />
            </div>
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
              placeholder="/images/sports/football.jpg"
              disabled={isSubmitting}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black disabled:bg-gray-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              Optional. Example: /images/sports/football.jpg
            </p>
          </div>

          {/* Active */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(event.target.checked)
              }
              disabled={isSubmitting}
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
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Sport"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}